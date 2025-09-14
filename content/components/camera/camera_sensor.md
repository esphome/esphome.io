---
description: "Instructions for setting up the camera_sensor component in ESPHome."
title: "Camera Sensor"
params:
  seo:
    description: Instructions for setting up the camera_sensor component in ESPHome.
    image: camera.svg
---

The ``camera_sensor`` component represents the first stage in the camera pipeline in ESPHome.
It provides a unified interface for camera sensor implementations, allowing both software
and hardware sensors to produce images for the rest of the camera pipeline.

ESPHome includes an initial software-based camera sensor which can be used for testing,
visualization of data, thermal cameras, or situations where no physical camera is available.

```yaml
# Example configuration entry
camera_sensor:
    type: software
    width: 256
    height: 256
    image_format: RGB565
```

## Configuration variables

- **type** (*Optional*): ``software``

## Software Options

- **width** (**Required**, int): Width of the generated image.
- **height** (**Required**, int): Height of the generated image.
- **format** (**Required**, enum): Pixel format of the image. Options are:
  - ``GRAYSCALE``: Each pixel is one byte representing grayscale values.
  - ``RGB565``: Two bytes per pixel, encoded as 5-6-5 for red, green, and blue.
{{< note >}}
When combining camera sensors with encoders, it may be necessary to perform little-endian to big-endian
transformations. This can easily be spotted if not only red and blue are swapped but also some static
appears in the image.
{{< /note >}}
  - ``BGR888``: Three bytes per pixel; the first byte is blue, followed by green and red.

- **buffer** (*Optional*, int): Number of allocated frame buffers. Using 2 framebuffers allows
  the pipeline to start processing of the second buffer before the first one is entirely completed,
  which can slightly improve throughput.
  Valid values: ``1``–``2``. Default: ``1``.

- **clear** (*Optional*, boolean): If the framebuffer should be cleared to zeros before processing
  starts. This can be convenient to avoid manual clearing via automations; however,
  skipping this can save time if the entire framebuffer is written anyway.
  - Default: ``True``.

## See Also

- {{< apiref "camera/sensor.h" "camera/sensor.h" >}}
- {{< apiref "camera_sensor/software_sensor.h" "camera_sensor/software_sensor.h" >}}
