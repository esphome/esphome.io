Camera Component
================

.. seo::
    :description: Modular camera framework for custom capture, overlays and image processing.
    :image: camera.svg

The ``camera`` component is a modular framework for handling image capture, graphic overlays,
encoding, and rendering. It provides a flexible structure for both physical and synthetic
camera integrations, and includes a camera ``display`` platform that simplifies overlaying of text and other
graphics on top of captured images.

This component supports direct usage through YAML by specifying automations such as ``on_capture_image`` and
by using the camera display.

Captured images can be rendered directly in Home Assisant, displayed locally using the ``esp32_camera_web_server``
running on the ESP32, or processed further using the ``on_image`` automation for custom output devices.

Common use cases include:

- Capturing and encoding images from thermal cameras or generating synthetic images programmatically
- Rendering sensor values and text as overlays
- Displaying images via Home Assistant or local web servers

.. figure:: /images/camera_overlay.jpg
    :align: center

    Synthetic camera with overlays displayed in Home Assistant

Image Specification During Capture
----------------------------------

During image capture, a ``spec`` object is available in the ``on_capture_image`` automation.
It provides details about the image data buffer, such as:

- ``width``
- ``height``
- ``bytes_per_pixel()``
- ``bytes_per_row()``
- ``bytes_per_image()``

Example usage of ``spec`` in ``on_capture_image``:

.. code-block:: yaml

    camera:
      - name: Test Camera
        width: 256
        height: 256
        image_format: RGB888
        on_capture_image:
          - lambda: |-
              static uint8_t frame_count = 0;
              int pixel_count = 0;
              uint8_t *rgb = image.data;
              for (int x = 0; x < spec.width; ++x) {
                for (int y = 0; y < spec.height; ++y) {
                  int idx = y * spec.bytes_per_row() + x * spec.bytes_per_pixel();
                  rgb[idx + 0] = frame_count + x;
                  rgb[idx + 1] = frame_count + y;
                  rgb[idx + 2] = frame_count + x + y;
                  ++pixel_count;
                }
              }
              if (spec.bytes_per_image() == pixel_count * spec.bytes_per_pixel())
                ++frame_count;

Context and Incremental Processing
----------------------------------

The example above blocks the main loop on an ESP32-S3 because the entire image
generation is done in a single loop cycle. This blocking can interfere with other
components and degrade system responsiveness.

To avoid this, incremental image capture can be used by leveraging a provided context
object. This object retains its state between loop calls when ``context.done`` is set to
``false``, allowing the image to be generated in smaller pieces across multiple cycles.

Example usage of ``context`` for non-blocking image generation:

.. code-block:: yaml

    camera:
      - name: Test Camera
        width: 256
        height: 256
        image_format: RGB888
        on_capture_image:
          - lambda: |-
              static uint8_t frame_count = 0;
              int pixel_count = 0;
              uint8_t *rgb = image.data;
              while (context.x < spec.width) {
                while (context.y < spec.height) {
                  int idx = context.y * spec.bytes_per_row() + context.x * spec.bytes_per_pixel();
                  rgb[idx + 0] = frame_count + context.x;
                  rgb[idx + 1] = frame_count + context.y;
                  rgb[idx + 2] = frame_count + context.x + context.y;
                  ++context.y;
                  ++pixel_count;
                  if (pixel_count >= 16384) {
                    context.done = false;
                    return;
                  }
                }
                context.y = 0;
                ++context.x;
              }
              ++frame_count;

Overlay Graphics Rendering
---------------------------

After an image is captured, additional graphics can be overlaid.
The ``camera`` component includes a ``display`` implementation for rendering overlays using
standard ESPHome display drawing APIs. This also supports incremental rendering via the ``context`` object.

Example using camera display for overlays:

.. code-block:: yaml

    font:
      - file: "gfonts://Roboto@600"
        id: roboto_16
        size: 16

    display:
      - platform: camera
        lambda: |-
          int shadow = 1;
          int offset = 2;
          int startX = 20;
          int startY = 20;
          if (context.state == 0) {
            context.x = -shadow;
            context.y = -shadow;
            ++context.state;
          }
          while (context.y <= shadow) {
            while (context.x <= shadow) {
              if ((context.x != 0) && (context.y != 0)) {
                it.print(startX + context.x + offset, startY + context.y + offset, id(roboto_16), Color(0x000000), "Camera Overlay Rendering:");
                it.print(startX + context.x + offset, startY + 40 + context.y + offset, id(roboto_16), Color(0x000000), "Temperature H: 40°C, 104°F");
                it.print(startX + context.x + offset, startY + 80 + context.y + offset, id(roboto_16), Color(0x000000), "Temperature L: 20°C, 68°F");
              }
              ++context.x;
            }
            context.x = 0;
            ++context.y;
            context.done = false;
            return;
          }

          it.print(startX, startY, id(roboto_16), Color(0xFFFFFF), "Camera Overlay Rendering:");
          it.print(startX, startY + 40, id(roboto_16), Color(0xFFFFFF), "Temperature H: 40°C, 104°F");
          it.print(startX, startY + 80, id(roboto_16), Color(0xFFFFFF), "Temperature L: 20°C, 68°F");

Incremental Encoding and Buffer Growth
--------------------------------------

JPEG encoding can be spread across multiple loop cycles by setting the ``encoder_mcu_count`` option,
which limits the number of MCUs processed in a single cycle.

If encoding fails due to an insufficient buffer, it can grow dynamically using the ``encoder_buffer_grow`` value.

Example:

.. code-block:: yaml

    camera:
      - name: Test Camera
        ...
        encoder_buffer_grow: 4096
        encoder_mcu_count: 256

Extending the Camera Framework
------------------------------

This component is designed to be extended:

- For physical camera integrations, see the ``esp32_camera`` component as an example implementation using this framework.
- The ``on_image`` automation gives access to the encoded image buffer, enabling storage or further processing.
- The encoder interface in the ``camera`` module can be used to implement, for example, hardware-accelerated encoders.
- Custom sources or renderers (e.g., QR codes, dashboards) can be implemented independently.

Configuration Variables
-----------------------

**Image Settings:**

- **height** (**Required**, int): Image height in pixels.
- **width** (**Required**, int): Image width in pixels.
- **image_format** (**Required**, enum):

  - ``GRAYSCALE``: 1 byte per pixel (8-bit grayscale)
  - ``RGB565``: 2 bytes per pixel (5R, 6G, 5B)
  - ``RGB888``: 3 bytes per pixel (8-bit RGB)

**Frame Settings:**

- **idle_update_interval** (Optional, int): Interval (ms) between frames when no streaming is active. ``0`` disables updates. Default: ``0``.
- **max_update_interval** (Optional, int): Max interval (ms) between frames during active streaming. Default: ``100``.

**Encoder Settings:**

- **encoder_buffer_size** (Optional, int): Initial JPEG buffer size. ``0`` disables incremental encoding. Default: ``4096``.
- **encoder_buffer_grow** (Optional, int): Additional bytes to allocate if encoding buffer is too small. Default: ``4096``.
- **encoder_mcu_count** (Optional, int):Max number of MCUs to encode per loop. ``0`` disables incremental encoding. Default: ``256``.
- **encoder_quality** (Optional, enum): JPEG quality. Default: ``BEST``. Options:

  - ``BEST``
  - ``HIGH``
  - ``MED``
  - ``LOW``
- **encoder_subsampling** (Optional, enum): Chroma subsampling. Default: ``444``. Options:

  - ``444``
  - ``420``

**Automations:**

- **on_capture_image** (Optional): Triggered before encoding; used to fill the image buffer.
- **on_overlay** (Optional): Triggered after capture; used to draw overlays.
- **on_image** (Optional): Triggered when an image is encoded.
- **on_stream_start** (Optional): Triggered when streaming starts.
- **on_stream_stop** (Optional): Triggered when streaming stops.

See Also
--------

- :doc:`display/index`
- :doc:`esp32_camera`
- :doc:`esp32_camera_web_server`
- :doc:`font`
- :apiref:`camera/camera.h`
- :ghedit:`Edit`
