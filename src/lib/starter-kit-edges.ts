import * as THREE from "three";

// Precomputed via script/starter-kit/generate_hero_edges.mjs — see that file for
// the binary layout. Ships the THREE.EdgesGeometry results for every mesh so
// the runtime doesn't have to recompute them (the dominant cost in the time
// between the loading spinner and the model appearing). Re-run the script
// whenever ESK.glb changes; a missing/stale/mismatched file falls back to
// computing edges live, per mesh. Shared by Hero.astro and SpecSection.astro,
// which both render the same model.
export const EDGES_URL = "/starter-kit/ESK-edges.bin";
const EDGES_MAGIC = 0x454b4531; // "EKE1"
const EDGES_FORMAT_VERSION = 2;
const EDGES_QUANT_MAX = 65535;

export type ParsedEdgeMesh = { sourceVertexCount: number; positions: Float32Array };

export function parseEdgesBuffer(buffer: ArrayBuffer | null): ParsedEdgeMesh[] | null {
  if (!buffer) return null;
  try {
    const header = new Uint32Array(buffer, 0, 3);
    if (header[0] !== EDGES_MAGIC || header[1] !== EDGES_FORMAT_VERSION) return null;
    const groupCount = header[2];
    let offset = 3 * 4;
    const meshCounts = new Uint32Array(buffer, offset, groupCount);
    offset += groupCount * 4;
    const meshCount = meshCounts.reduce((a, b) => a + b, 0);
    const sourceVertexCounts = new Uint32Array(buffer, offset, meshCount);
    offset += meshCount * 4;
    const edgeVertexCounts = new Uint32Array(buffer, offset, meshCount);
    offset += meshCount * 4;
    // Per-mesh quantization origin (min) + span (range), one triplet each.
    const quantParams = new Float32Array(buffer, offset, meshCount * 6);
    offset += meshCount * 6 * 4;
    const meshes: ParsedEdgeMesh[] = [];
    for (let i = 0; i < meshCount; i++) {
      const vertCount = edgeVertexCounts[i];
      const quantized = new Uint16Array(buffer, offset, vertCount * 3);
      offset += vertCount * 3 * 2;
      const [minX, minY, minZ, rangeX, rangeY, rangeZ] = quantParams.slice(i * 6, i * 6 + 6);
      const min = [minX, minY, minZ];
      const range = [rangeX, rangeY, rangeZ];
      const positions = new Float32Array(vertCount * 3);
      for (let v = 0; v < vertCount * 3; v++) {
        const a = v % 3;
        positions[v] = min[a] + (quantized[v] / EDGES_QUANT_MAX) * range[a];
      }
      meshes.push({ sourceVertexCount: sourceVertexCounts[i], positions });
    }
    return meshes;
  } catch {
    return null;
  }
}

// Missing/stale/mismatched edge data falls back to computing edges live per
// mesh, so a failed fetch here is non-fatal — never rejects.
export function loadEdgesBuffer(): Promise<ArrayBuffer | null> {
  return fetch(EDGES_URL)
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .catch(() => null);
}

// Edge overlay geometry for a single mesh: the precomputed geometry when
// available and its vertex count still matches the mesh's live geometry
// (i.e. the model hasn't changed since the precompute script last ran),
// otherwise a live THREE.EdgesGeometry computed for this mesh only.
export function createEdgeGeometry(mesh: THREE.Mesh, precomputed: ParsedEdgeMesh | undefined): THREE.BufferGeometry {
  if (precomputed && precomputed.sourceVertexCount === mesh.geometry.attributes.position.count) {
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(precomputed.positions, 3));
  }
  return new THREE.EdgesGeometry(mesh.geometry, 30);
}
