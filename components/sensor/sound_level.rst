Sound Level Sensor
==================

.. seo::
    :description: Instructions for setting up microphone sound level sensors with ESPHome
    :image: waveform.svg 
    :keywords: sound level

The ``sound_level`` sensor platform allows you to measure a :doc:`microphone </components/microphone/index>`'s average and peak sound pressure levels over a specified measurement duration. The sensors output in **relative** ``dB``, where ``0 dB`` represents the loudest sound the microphone can measure.

.. warning::

    Audio and voice components consume a significant amount of resources (RAM, CPU) on the device.

    **Crashes are likely to occur** if you include too many additional components in your device's
    configuration. In particular, Bluetooth/BLE components are known to cause issues when used in
    combination with Voice Assistant and/or other audio components.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: sound_level
        passive: true
        peak:
          name: "Peak Loudness"
        rms:
          name: "Average Loudness"

Configuration variables:
------------------------

- **microphone** (**Required**, :ref:`config-microphone-source`): The :doc:`microphone </components/microphone/index>` settings to use for input. Multiple channels may be selected.
- **measurement_duration** (*Optional*, :ref:`config-time`): The time duration for each sound level measurement. Ranges from ``50ms`` to ``60s``. Defaults to ``1000ms``.
- **passive** (**Required**, boolean). Whether passive mode is enabled. See :ref:`Passive Mode <sound_level-passive>`.
- **peak** (*Optional*): The information for the peak loudness sensor.

  - All options from :ref:`Sensor <config-sensor>`.

- **rms** (*Optional*): The information for the Root Mean Square loudness sensor.

  - All options from :ref:`Sensor <config-sensor>`.

.. _sound_level-passive:

Passive Mode
------------

If the sound level component is configured in passive mode, then it will only measure sound levels when another ESPHome component is capturing audio from the microphone. If disabled, then you must manually start and stop capturing using actions (see :ref:`Sound Level Actions <sound_level-actions>`). When passive mode is disabled, it will automatically start the microphone when the component sets up.

.. warning::

    Some devices do not support duplex audio, meaning they cannot output audio to a speaker at the same time as capturing audio from a microphone. On these devices, with passive mode disabled, you must take care to manually stop the ``sound_level`` component whenever you want to send audio to the speaker component. No manual management is necessary if you enable passive mode.


.. _sound_level-actions:

Sound Level Actions
-------------------

The following actions are available for use in automations:

``sound_level.start`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Starts measuring sound levels. Does nothing in passive mode.

``sound_level.stop`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Stops measuring sound levels. Does nothing in passive mode.

See Also
--------

- `Root Mean Square (Wikipedia) <https://en.wikipedia.org/wiki/Root_mean_square>`__
- :ref:`sensor-filters`
- :apiref:`sound_level/sound_level.h`
- :ghedit:`Edit`
