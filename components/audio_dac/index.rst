Audio DAC Core
==============

.. seo::
    :description: Instructions for using ESPHome's Audio DAC Core component.
    :image: i2s_audio.svg
    :keywords: Audio, DAC, I2S, ESP32

The `audio_dac` component allows your ESPHome devices to use audio DAC hardware components, allowing the playback of
audio via the microcontroller from a range of sources via :doc:`/components/media_player/index`.

.. code-block:: yaml

    # Example configuration entry
    audio_dac:
      - platform: ...

.. _config-audio_dac:

Configuration variables:
------------------------

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.

.. _automations-audio_dac:

Automations
-----------

``audio_dac.mute_off`` Action
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This action unmutes the output of the DAC.

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The ID of the ``audio_dac`` platform.

``audio_dac.mute_on`` Action
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This action mutes the output of the DAC.

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The ID of the ``audio_dac`` platform.

``audio_dac.set_volume`` Action
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This action sets the output volume of the DAC.

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The ID of the ``audio_dac`` platform.
- **volume** (**Required**, percentage, :ref:`templatable <config-templatable>`): The desired volume level for the
  output from 0% to 100%.

Platforms
---------

.. toctree::
    :maxdepth: 1
    :glob:

    *

See Also
--------

- :ghedit:`Edit`
