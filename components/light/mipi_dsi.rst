MIPI DSI Backlight
===================

.. seo::
    :description: Instructions for setting up backlight control on a DSI Display panel
    :image: brightness-medium.svg

The ``mipi_dsi`` light platform creates a simple brightness-only light for a DSI display panel backlight.

.. code-block:: yaml

    # Example configuration entry
    light:
      - platform: mipi_dsi
        id: backlight

Configuration options
---------------------

- **address** (*Optional*, uint8): I²C address of the device. Defaults to 0x45.
- **pwm_register** (*Optional*, uint8): The address of the PWM register; defaults to 0x86, may be 0x96 on some displays.
- **inverted** (*Optional*, bool): Whether the brightness is inverted; defaults to ``false``
- All other options from :ref:`Light <config-light>`.

See Also
--------

- :doc:`/components/display/mipi_dsi`
- :ghedit:`Edit`
