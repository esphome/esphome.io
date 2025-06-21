FastLED Light
=============

.. seo::
    :description: Instructions for setting up FastLED addressable lights like NEOPIXEL.
    :image: color_lens.svg

.. warning::

    FastLED does **not** work as expected with Arduino 3 or newer for ESP8266. For now, you can either downgrade the arduino version or use :doc:`neopixelbus`.

    .. code-block:: yaml

        esp8266:
          framework:
            version: 2.7.4

    See these related issues:

    - https://github.com/FastLED/FastLED/issues/1322
    - https://github.com/FastLED/FastLED/issues/1264

.. warning::

    FastLED does **not** work with ESP-IDF.

    For addressable lights, you can use :doc:`esp32_rmt_led_strip` or for SPI LEDs see :doc:`spi_led_strip`..

.. _fastled-clockless:

Clockless
---------

The ``fastled_clockless`` light platform allows you to create RGB lights
in ESPHome for a :ref:`number of supported chipsets <fastled_clockless-chipsets>`.

Clockless FastLED lights differ from the
:ref:`fastled-spi` in that they only have a single data wire to connect, and not separate data and clock wires.

.. figure:: images/fastled_clockless-ui.png
   :align: center
   :width: 60.0%

.. code-block:: yaml

    # Example configuration entry
    light:
      - platform: fastled_clockless
        chipset: WS2811
        pin: GPIOXX
        num_leds: 60
        rgb_order: BRG
        name: "FastLED WS2811 Light"

Configuration variables:
************************

- **chipset** (**Required**, string): Set a chipset to use.
  See :ref:`fastled_clockless-chipsets` for options.
- **pin** (**Required**, :ref:`config-pin`): The pin for the data line of the FastLED light.
- **num_leds** (**Required**, int): The number of LEDs attached.
- **rgb_order** (*Optional*, string): The order of the RGB channels. Use this if your
  light doesn't seem to map the RGB light channels correctly. For example if your light
  shows up green when you set a red color through the frontend. Valid values are ``RGB``,
  ``RBG``, ``GRB``, ``GBR``, ``BRG`` and ``BGR``. Defaults to ``RGB``.
- **max_refresh_rate** (*Optional*, :ref:`config-time`):
  A time interval used to limit the number of commands a light can handle per second. For example
  16ms will limit the light to a refresh rate of about 60Hz. Defaults to the default value for the used chipset.
- All other options from :ref:`Light <config-light>`.

.. _fastled_clockless-chipsets:

Supported Chipsets
******************

- ``NEOPIXEL``
- ``WS2811``
- ``WS2811_400`` (``WS2811`` with a clock rate of 400kHz)
- ``WS2812B``
- ``WS2812``
- ``WS2813``
- ``WS2852``
- ``APA104``
- ``APA106``
- ``GW6205``
- ``GW6205_400`` (``GW6205`` with a clock rate of 400kHz)
- ``LPD1886``
- ``LPD1886_8BIT`` (``LPD1886`` with 8-bit color channel values)
- ``PL9823``
- ``SK6812``
- ``SK6822``
- ``TM1803``
- ``TM1804``
- ``TM1809``
- ``TM1829``
- ``UCS1903B``
- ``UCS1903``
- ``UCS1904``
- ``UCS2903``
- ``SM16703``

.. _fastled-spi:

SPI
---

The ``fastled_spi`` light platform allows you to create RGB lights
in ESPHome for a :ref:`number of supported chipsets <fastled_spi-chipsets>`.

See :doc:`/components/light/spi_led_strip` for an alternative component that works on ESP-IDF (and Arduino.)

SPI FastLED lights differ from the
:ref:`fastled-clockless` in that they require two pins to be connected, one for a data and one for a clock signal
whereas the clockless lights only need a single pin.

.. figure:: images/fastled_spi-ui.png
    :align: center
    :width: 60.0%

.. code-block:: yaml

    # Example configuration entry
    light:
      - platform: fastled_spi
        chipset: WS2801
        data_pin: GPIOXX
        clock_pin: GPIOXX
        num_leds: 60
        rgb_order: BRG
        name: "FastLED SPI Light"

Configuration variables:
************************

- **chipset** (**Required**, string): Set a chipset to use. See :ref:`fastled_spi-chipsets` for options.
- **data_pin** (**Required**, :ref:`config-pin`): The pin for the data line of the FastLED light.
- **clock_pin** (**Required**, :ref:`config-pin`): The pin for the clock line of the FastLED light.
- **num_leds** (**Required**, int): The number of LEDs attached.
- **rgb_order** (*Optional*, string): The order of the RGB channels. Use this if your
  light doesn't seem to map the RGB light channels correctly. For example if your light
  shows up green when you set a red color through the frontend. Valid values are ``RGB``,
  ``RBG``, ``GRB``, ``GBR``, ``BRG`` and ``BGR``. Defaults to ``RGB``.
- **max_refresh_rate** (*Optional*, :ref:`config-time`):
  A time interval used to limit the number of commands a light can handle per second. For example
  16ms will limit the light to a refresh rate of about 60Hz. Defaults to the default value for the used chipset.
- **data_rate** (*Optional*, frequency): The data rate to use for shifting data to the light. Can help if you
  have long cables or slow level-shifters.
- **effects** (*Optional*, list): A list of :ref:`light effects <light-effects>` to use for this light.
- All other options from :ref:`Light <config-light>`.

.. _fastled_spi-chipsets:

Supported Chipsets
******************

- ``APA102``
- ``DOTSTAR``
- ``LPD8806``
- ``P9813``
- ``SK9822``
- ``SM16716``
- ``WS2801``
- ``WS2803``

See Also
--------

- :doc:`/components/light/index`
- :doc:`/components/light/spi_led_strip`
- :doc:`/components/power_supply`
- :apiref:`fastled_base/fastled_light.h`
- `Arduino FastLED library <https://github.com/FastLED/FastLED>`__
- :ghedit:`Edit`
