Camera Component
================

.. seo::
    :description: Modular camera framework.
    :image: camera.svg

The ``camera`` component is a modular framework.

Captured images can be rendered directly in Home Assisant, or displayed locally using the ``esp32_camera_web_server``
running on the ESP32.

Common use cases include:

- Capturing and encoding images from thermal cameras or generating synthetic images programmatically
- Displaying images via Home Assistant or local web servers

Extending the Camera Framework
------------------------------

This component is designed to be extended:

- For physical camera integrations, see the ``esp32_camera`` component as an example implementation using this framework.

See Also
--------

- :doc:`esp32_camera`
- :doc:`esp32_camera_web_server`
- :apiref:`camera/camera.h`
- :ghedit:`Edit`
