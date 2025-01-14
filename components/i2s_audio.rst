.. _i2s_audio:

I²S Audio Component
===================

.. seo::
    :description: Instructions for setting up I²S based devices in ESPHome.
    :image: i2s_audio.svg

The ``i2s_audio`` component allows for sending and receiving audio via I²S.
This component only works on ESP32 based chips.

.. code-block:: yaml

    # Example configuration entry
    i2s_audio:
      i2s_lrclk_pin: GPIOXX
      i2s_bclk_pin: GPIOXX

Configuration variables:
------------------------

- **i2s_lrclk_pin** (**Required**, :ref:`config-pin`): The GPIO pin to use for the I²S ``LRCLK`` *(Left/Right Clock)* signal, also referred to as ``WS`` *(Word Select)* or ``FS`` *(Frame Sync)*.
- **i2s_bclk_pin** (*Optional*, :ref:`config-pin`): The GPIO pin to use for the I²S ``BCLK`` *(Bit Clock)* signal, also referred to as ``SCK`` *(Serial Clock)*.
- **i2s_mclk_pin** (*Optional*, :ref:`config-pin`): The GPIO pin to use for the I²S ``MCLK`` *(Master Clock)* signal.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID for this I²S bus if you need multiple.

See also
--------

- :doc:`microphone/i2s_audio`
- :doc:`media_player/i2s_audio`
- :doc:`speaker/i2s_audio`
- :ghedit:`Edit`
