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
- **use_legacy** (*Optional, boolean*): Use the legacy I²S driver when using esp-idf framework version 5.x.x. Not valid for Arduino framework or esp-idf version < 5. All ``i2s_audio`` components need to use the same setting. Defaults to ``false``.

See also
--------

- :doc:`microphone/i2s_audio`
- :doc:`media_player/i2s_audio`
- :doc:`speaker/i2s_audio`
- :ghedit:`Edit`
