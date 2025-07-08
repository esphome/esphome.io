SPI LED Strip Light
===================

.. seo::
    :description: Instructions for setting up SPI LED RGB lights in ESPHome.
    :image: ../components/light/images/apa102.jpg

The ``spi_led_strip`` light platform drives one or more SPI interfaced RGB LEDs. These LEDs are often used in strips, where
each LED is individually addressable. This component requires an SPI interface to be configured.

This component has been tested with APA102 LEDs and the P9813 LED driver. It should also work with HD107 and SK9822 type
LEDs, or any others with a similar interface - SPI, 8 bits per colour and BGR ordering.

.. figure:: images/apa102.jpg
    :align: center
    :width: 75.0%

.. code-block:: yaml

    # Example configuration entry
    spi:
      mosi_pin: GPIO06
      clk_pin: GPIO07

    light:
      - platform: spi_led_strip
        num_leds: 30
        id: rgb_led
        name: "RGB LED Strip"
        data_rate: 1MHz

Color Correction
----------------

It is often favourable to calibrate/correct the color produced by an LED strip light as the
perceived intensity of different colors will generally vary. This can be done by using
``color_correct`` to adjust the relative brightness of the RGB components.

Configuration variables:
------------------------

- **num_leds** (*Optional*, int): The number of LEDs attached. The default is 1.
- **data_rate** (*Optional*): Set the data rate of the SPI interface to the display. One of ``80MHz``, ``40MHz``, ``20MHz``, ``10MHz``, ``5MHz``, ``2MHz``, ``1MHz`` (default), ``200kHz``, ``75kHz`` or ``1kHz``.
- All other options from :ref:`Light <config-light>`.

You may also need to configure an ``output`` GPIO pin to control power to the LEDs, depending on your hardware. The
APA102 and friends do not have a ``CS`` input, and are write-only so the SPI ``miso`` pin should not be specified.

See Also
--------

.. figure:: images/rgb-detail.jpg
    :align: center
    :width: 75.0%

- :doc:`/components/light/index`
- :doc:`/components/output/ledc`
- :doc:`/components/output/esp8266_pwm`
- :doc:`/components/output/pca9685`
- :doc:`/components/output/tlc59208f`
- :doc:`/components/output/my9231`
- :doc:`/components/output/sm16716`
- :apiref:`rgb/rgb_light_output.h`
- :ghedit:`Edit`
