SDL2 Touch Screen Emulator
==========================

.. seo::
    :description: Instructions for setting up touch screen emulation with the sdl display driver.
    :keywords: sdl, touchscreen

.. _sdl_touchscreen:

The ``sdl`` touchscreen platform allows emulating a touch screen by using the mouse with the ``sdl`` display driver.
The ``sdl`` display component must be configured to use this.

Base Touchscreen Configuration
------------------------------

.. code-block:: yaml

    # Example configuration entry
    touchscreen:
      platform: sdl

Configuration variables:
************************

- **id** (*Optional*, :ref:`config-id`): Manually set the ID of this touchscreen.

- All other options from :ref:`Touchscreen <config-touchscreen>`.


See Also
--------

- :ref:`SDL display <sdl>`
- :apiref:`sdl/sdl_touchscreen.h`
- :ghedit:`Edit`
