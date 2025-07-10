Camera Component
================

.. seo::
    :description: Instructions for setting up cameras in ESPHome.
    :image: camera.svg

The ``camera`` component is the base abstraction layer for camera implementations in ESPHome. It provides a 
standardized interface between camera hardware/software implementations and the ESPHome API layer.

.. note::

    This component cannot be used directly. It serves as the base platform that specific camera 
    implementations (like :doc:`/components/esp32_camera`) build upon.

Overview
--------

The camera component acts as a foundation for camera integrations, with :doc:`/components/esp32_camera` being the 
first implementation using this framework.

All camera implementations in ESPHome inherit from this base component, ensuring a consistent API 
for image capture and transmission to Home Assistant or other consumers.

Camera Platforms
----------------

.. toctree::
    :maxdepth: 1
    :glob:

See Also
--------

- :doc:`/components/esp32_camera`
- :doc:`/components/esp32_camera_web_server`
- :apiref:`camera/camera.h`
- :ghedit:`Edit`
