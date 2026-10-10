# ESP32 Camera Utils

A dedicated component for advanced image processing operations on ESP32, specifically designed to prepare images for AI models. However, for the **Meter Reader** component, you should configure rotation directly in the `meter_reader_tflite` configuration.

## ✨ Features

- **esp_new_jpeg Integration**: Uses the v1.0.0+ library for efficient JPEG decoding.
- **Image Rotation**: Supports 0°/90°/180°/270° (hardware-accelerated) and arbitrary float angles via `enable_rotation`.
    - **JPEG**: Hardware-assisted rotation during decoding.
    - **Raw (RGB/Gray)**: Optimized software rotation.
- **Format Conversion**: Handles RGB888, RGB565, Grayscale, YUV422 (YUYV), and JPEG.
- **Cropping & Scaling**: Efficiently extracts zones and scales them to model input dimensions.
- **Normalization**: Converts standard pixel data to float32 (0.0-1.0) or int8/uint8 specific ranges.

## ⚙️ Configuration

This component is responsible for image rotation and preprocessing.

```yaml
esp32_camera_utils:
  id: camera_utils
  camera_id: my_camera # ID of the esp32_camera component

  # Global Rotation Setting (arbitrary float, clockwise degrees)
  # 0/90/180/270 are hardware-optimized; any other value uses software rotation.
  rotation: 90.0
  enable_rotation: true

  # Camera Windowing (Hardware Cropping)
  # Useful for OV2640/OV3660 to zoom in before capture
  camera_window:
    offset_x: 928
    offset_y: 480
    width: 448
    height: 88

  debug: false
```

## 🛠️ Internal Usage

The `ImageProcessor` class provides the core functionality:

```cpp
#include "esphome/components/esp32_camera_utils/image_processor.h"

// Configuration
ImageProcessorConfig config;
config.width = 640;
config.height = 480;
config.rotation = ROTATION_90;

// Processing
ImageProcessor processor(config);
processor.process_zone_to_buffer(image, zone, output_buffer, size);
```

## 🧠 Memory & PSRAM

`esp32_camera_utils` is designed to run on devices **with or without PSRAM**. Large buffers are
allocated with `heap_caps_aligned_alloc(MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT)` and **automatically
fall back to internal RAM** when PSRAM is absent or exhausted. Never assume PSRAM exists — check
`psramFound()` before relying on the sizes below.

Expected heap consumption (per frame, peak):

| Source format | 640×480 example |
|---|---|
| JPEG decode output (RGB888) | ~921 KB |
| JPEG decode output (grayscale, 1 ch) | ~307 KB |
| Rotation scratch buffer | up to `w·h·ch` extra |
| Model input (float32) | `w·h·ch·4` |
| Model input (uint8/int8) | `w·h·ch` |

Key memory behaviors:

- **BufferPool**: model-input buffers ≤ 50 KB are pooled and reused across frames (no per-frame
  heap churn). Pool stats are logged when `debug: true` is set.
- **JPEG decode buffer**: allocated per frame with `jpeg_calloc_align()`; not pooled. On very
  low-memory devices prefer `pixel_format: GRAYSCALE` or smaller resolutions.
- **RAII everywhere**: JPEG decoders (`jpeg_dec_close`), JPEG buffers (`jpeg_free_align`) and heap
  buffers (`heap_caps_free`) are all released automatically — no manual `free()` in user code.
- **Debug sensors**: enable `debug_memory: true` to expose `camera_buffer_size`,
  `camera_free_psram`, and the `camera_min_free_psram` / `camera_min_free_internal`
  "minimum free since boot" watermarks (useful to spot long-run fragmentation).

> **Tip for no-PSRAM boards**: keep JPEG resolution low (e.g. QVGA 320×240), use a grayscale model,
> and avoid arbitrary software rotation (0/90/180/270 are cheaper).

## 🔍 Debugging

Enable `debug: true` to see:
- Buffer allocation details
- JPEG decoding performance stats
- Rotation processing times
- Zone coordinate validations
