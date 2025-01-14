ESP32 RMT LED Strip
===================

.. seo::
    :description: Instructions for setting up addressable lights like NEOPIXEL on an ESP32 using the RMT peripheral.
    :image: color_lens.svg

This is a component using the ESP32 RMT peripheral to drive most addressable LED strips.

.. code-block:: yaml

    light:
      - platform: esp32_rmt_led_strip
        rgb_order: GRB
        pin: GPIOXX
        num_leds: 30
        rmt_channel: 0
        chipset: ws2812
        name: "My Light"

Configuration variables
-----------------------

- **pin** (**Required**, :ref:`config-pin`): The pin for the data line of the light.
- **num_leds** (**Required**, int): The number of LEDs in the strip.
- **rmt_channel** (**Required**, int): The RMT channel to use. If using multiple strips, you need to use different channels.

  .. csv-table::
      :header: "ESP32 Variant", "Channels"

      "ESP32", "0, 1, 2, 3, 4, 5, 6, 7"
      "ESP32-S2", "0, 1, 2, 3"
      "ESP32-S3", "0, 1, 2, 3"
      "ESP32-C3", "0, 1"

- **chipset** (**Required**, enum): The chipset to apply known timings from. Not used if specifying the timings manually, see below.
    - ``WS2811``
    - ``WS2812``
    - ``SK6812``
    - ``APA106``
    - ``SM16703``

- **rgb_order** (**Required**, string): The RGB order of the strip.
    - ``RGB``
    - ``RBG``
    - ``GRB``
    - ``GBR``
    - ``BGR``
    - ``BRG``

- **is_rgbw** (*Optional*, boolean): Set to ``true`` if the strip is RGBW. Defaults to ``false``.
- **is_wrgb** (*Optional*, boolean): Set to ``true`` if the strip is WRGB. Defaults to ``false``.
- **max_refresh_rate** (*Optional*, :ref:`config-time`):
  A time interval used to limit the number of commands a light can handle per second. For example
  16ms will limit the light to a refresh rate of about 60Hz. Defaults to sending commands as quickly as
  changes are made to the lights.
- **use_psram** (*Optional*, boolean): Set to ``false`` to force internal RAM allocation even if you have the the PSRAM component enabled. This can be useful if you're experiencing issues like flickering with your leds strip. Defaults to ``true``.

- All other options from :ref:`Light <config-light>`.


Manual Timings
**************

These can be used if you know the timings and your chipset is not set above. If you have a new specific chipset,
please consider adding support to the codebase and add it to the list above.

- **bit0_high** (*Optional*, :ref:`config-time`): The time to hold the data line high for a ``0`` bit.
- **bit0_low** (*Optional*, :ref:`config-time`): The time to hold the data line low for a ``0`` bit.
- **bit1_high** (*Optional*, :ref:`config-time`): The time to hold the data line high for a ``1`` bit.
- **bit1_low** (*Optional*, :ref:`config-time`): The time to hold the data line low for a ``1`` bit.
- **reset_high** (*Optional*, :ref:`config-time`): The time to hold the data line high after writing
  the state. Defaults to ``0 us``.
- **reset_low** (*Optional*, :ref:`config-time`): The time to hold the data line low after writing
  the state. Defaults to ``0 us``.

See Also
--------

- :doc:`/components/light/index`
- :doc:`/components/power_supply`
- :apiref:`esp32_rmt_led_strip/esp32_rmt_led_strip.h`
- :ghedit:`Edit`
