#!/usr/bin/env node
// Precomputes the wireframe edge overlays that src/components/starter-kit/Hero.astro
// builds at runtime via THREE.EdgesGeometry — that computation is the dominant cost
// in the model's load-to-visible time (~600ms+ for this model's ~334k triangles),
// entirely on the main thread, before the intro animation can start.
//
// This script runs the identical EdgesGeometry pass once, offline, and serializes
// the results into a binary file the runtime fetches and uses directly instead of
// recomputing them. Re-run this whenever public/starter-kit/ESK.glb changes.
//
// Usage: node script/starter-kit/generate_hero_edges.mjs

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.join(__dirname, "..", "..", "public", "starter-kit", "ESK.glb");
const OUTPUT_PATH = path.join(__dirname, "..", "..", "public", "starter-kit", "ESK-edges.bin");

// Must match the threshold angle passed to `new THREE.EdgesGeometry(...)`
// in Hero.astro.
const EDGE_THRESHOLD_ANGLE = 30;

// Sanity marker so the runtime can reject a missing/corrupt/unrelated file
// instead of misreading it as edge data.
const MAGIC = 0x454b4531; // "EKE1"
const FORMAT_VERSION = 2;

// Per-mesh 16-bit quantization (position packed relative to that mesh's own
// local-space AABB) — halves the payload vs. raw float32 with no visible
// precision loss at this model's scale (a mesh spanning ~0.1-0.5 units gets
// ~65k steps across that range, several orders of magnitude finer than a
// pixel at any zoom level this scene uses).
const QUANT_MAX = 65535;

function quantizeMesh(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const v = positions[i + a];
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }
  const range = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const quantized = new Uint16Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const r = range[a];
      quantized[i + a] = r > 0 ? Math.round(((positions[i + a] - min[a]) / r) * QUANT_MAX) : 0;
    }
  }
  return { min, range, quantized };
}

function loadGLTF(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.parse(arrayBuffer, "", resolve, reject);
  });
}

async function main() {
  const fileBuffer = fs.readFileSync(MODEL_PATH);
  const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

  const gltf = await loadGLTF(arrayBuffer);
  const topLevel = [...gltf.scene.children];

  // Mirrors Hero.astro's groupFades traversal exactly (including the
  // isMesh + material-present filter) so the flattened mesh order here
  // lines up 1:1 with the mesh order the runtime encounters.
  const groups = topLevel.map((obj) => {
    const meshes = [];
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const src = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!src) return;
      meshes.push(o);
    });
    return meshes;
  });

  const meshRecords = [];
  const t0 = performance.now();
  for (const meshes of groups) {
    for (const mesh of meshes) {
      const edges = new THREE.EdgesGeometry(mesh.geometry, EDGE_THRESHOLD_ANGLE);
      const { min, range, quantized } = quantizeMesh(edges.attributes.position.array);
      meshRecords.push({
        sourceVertexCount: mesh.geometry.attributes.position.count,
        vertexCount: quantized.length / 3,
        min,
        range,
        quantized,
      });
    }
  }
  const elapsedMs = performance.now() - t0;

  // ---- Serialize ----
  // Layout (all values little-endian, native TypedArray order):
  //   uint32 magic
  //   uint32 formatVersion
  //   uint32 groupCount
  //   uint32 meshCountPerGroup[groupCount]
  //   uint32 sourceVertexCount[meshCount]   (flattened, group-major order)
  //   uint32 edgeVertexCount[meshCount]     (flattened, group-major order)
  //   float32 minXYZ[meshCount * 3]         (per-mesh quantization origin)
  //   float32 rangeXYZ[meshCount * 3]       (per-mesh quantization span)
  //   uint16 quantizedPositions[sum(edgeVertexCount) * 3]
  const groupCount = groups.length;
  const meshCounts = groups.map((g) => g.length);
  const meshCount = meshRecords.length;

  const header = new Uint32Array(3 + groupCount + meshCount + meshCount);
  let hi = 0;
  header[hi++] = MAGIC;
  header[hi++] = FORMAT_VERSION;
  header[hi++] = groupCount;
  for (const c of meshCounts) header[hi++] = c;
  for (const m of meshRecords) header[hi++] = m.sourceVertexCount;
  for (const m of meshRecords) header[hi++] = m.vertexCount;

  const quantParams = new Float32Array(meshCount * 6);
  let qi = 0;
  for (const m of meshRecords) {
    quantParams[qi++] = m.min[0];
    quantParams[qi++] = m.min[1];
    quantParams[qi++] = m.min[2];
    quantParams[qi++] = m.range[0];
    quantParams[qi++] = m.range[1];
    quantParams[qi++] = m.range[2];
  }

  const totalEdgeVerts = meshRecords.reduce((sum, m) => sum + m.vertexCount, 0);
  const body = new Uint16Array(totalEdgeVerts * 3);
  let bi = 0;
  for (const m of meshRecords) {
    body.set(m.quantized, bi);
    bi += m.quantized.length;
  }

  // Uint16Array must start on a 2-byte boundary within the final buffer —
  // header (uint32) and quantParams (float32) sections are both already
  // multiples of 4 bytes, so the body starts safely aligned.
  const out = Buffer.concat([Buffer.from(header.buffer), Buffer.from(quantParams.buffer), Buffer.from(body.buffer)]);
  fs.writeFileSync(OUTPUT_PATH, out);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`  groups: ${groupCount}, meshes: ${meshCount}`);
  console.log(`  total edge line vertices: ${totalEdgeVerts}`);
  console.log(`  file size: ${(out.byteLength / 1024).toFixed(1)} KB`);
  console.log(`  EdgesGeometry compute time (offline): ${elapsedMs.toFixed(1)} ms`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
