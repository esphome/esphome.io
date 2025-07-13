Camera Encoder
==============

.. seo::
    :description: Instructions for setting up the camera encoder component in ESPHome
    :image: camera.svg

The ``camera_encoder`` component provides image compression support for software-based cameras or cameras without
internal compression. It allows raw camera frames to be compressed into a format suitable for transmission to API
clients, such as Home Assistant, which expect JPEG-compressed images.

It supports different encoder implementations, such as a default software JPEG encoder that can be configured with
options like image quality, subsampling, and incremental encoding. These settings make it possible to balance image
quality and performance depending on the use case.

.. note::

    The default software JPEG encoder enables devices like the ESP32-S3 to stream images.
    It is primarily intended for smallar images due to limited processing power and memory.

.. code-block:: yaml

    # Example configuration entry
    camera-encoder:

Configuration variables:
------------------------

- **type** (*Optional*): ``default``

Default Options:
^^^^^^^^^^^^^^^^

- **quality** (*Optional*, enum): Selects compression quality. Defaults to ``HIGH``.

    - ``BEST`` (Least compression artifacts)
    - ``HIGH`` (Minor artifacts)
    - ``MED`` (Visible artifacts)
    - ``LOW`` (Most artifacts)

- **subsampling** (*Optional*, enum): Enables additional color compression to reduce image size at the expense of color fidelity. Defaults to ``444``.

    - ``444`` (No color compression)
    - ``420`` (Reduces color data to a quarter)

- **mcu_count** (*Optional*, int): Limits the number of MCU blocks processed per call to support incremental encoding. Prevents blocking other components at the expense of potentially lower frame rates. Defaults to ``0`` (incremental encoding disabled).

See Also
--------

- :doc:`/components/camera/index`
- :apiref:`camera_encoder/default_jpeg_encoder.h`
- :apiref:`camera/encoder.h`
- :ghedit:`Edit`
