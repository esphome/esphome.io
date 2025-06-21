Audio ADC Core
==============

.. seo::
    :description: Instructions for using ESPHome's Audio ADC Core component.
    :image: i2s_audio.svg
    :keywords: Audio, ADC, I2S, ESP32

The ``audio_adc`` component allows your ESPHome devices to use audio ADC hardware components, allowing the
capture/recording of audio via the microcontroller from a range of sources.

.. code-block:: yaml

    # Example configuration entry
    audio_adc:
      - platform: ...

Platforms
---------

.. toctree::
    :maxdepth: 1
    :glob:

    *

.. _config-audio_adc:

Configuration variables:
------------------------

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.

.. _automations-audio_adc:

Automations
-----------

``audio_adc.set_mic_gain`` Action
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This action sets the (microphone) gain of the ADC.

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The ID of the ``audio_adc`` platform.
- **mic_gain** (**Required**, percentage, :ref:`templatable <config-templatable>`): The desired gain level in decibels
  for the input.

See Also
--------

- :ghedit:`Edit`
