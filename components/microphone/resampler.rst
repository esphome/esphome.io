Resampler Microphone
====================

.. seo::
    :description: Instructions for setting up resampler microphones in ESPHome.
    :image: waveform.svg

The ``resampler`` microphone platform allows you to convert the sample rate of one microphone's audio stream and makes it available as another :doc:`microphone component </components/microphone/index>`.

If the audio stream doesn't require resampling, then the audio is passed through unmodified.

This platform only works on ESP32 based chips.

.. warning::

    Audio and voice components consume a significant amount of resources (RAM and CPU) on the device.

    **Crashes are likely to occur** if you include too many additional components in your device's
    configuration. In particular, Bluetooth/BLE components are known to cause issues when used in
    combination with Voice Assistant and/or other audio components.

.. code-block:: yaml

    # Example configuration entry
    microphone:
      - platform: resampler
        sample_rate: 16000
        microphone: source_mic

Configuration variables:
------------------------

- **microphone** (**Required**, :ref:`config-microphone-source`): The :doc:`microphone </components/microphone/index>` settings to use as the source. See
  :ref:`channels <resampler_microphone-channels>` for clarification about channel numbering.
- **buffer_duration** (*Optional*, :ref:`config-time`): The duration of the internal ring buffer. Larger values may reduce stuttering but use more memory. Defaults to ``100ms``.
- **sample_rate** (*Optional*, positive integer): Sample rate to convert to in hertz. Must be between ``8000`` and ``48000``. Defaults to ``16000``.
- **filters** (*Optional*, positive integer): The number of windowed sinc interpolation filters to use. Must be between ``2`` and ``1024``. Defaults to ``16``.
- **taps** (*Optional*, positive integer): The number of taps per windowed sinc interpolation filter. Must between ``16`` and ``128`` and divisible by 4. Defaults to ``16``.
- **task_stack_in_psram** (*Optional*, boolean): Only with ``esp-idf``. Run the resampling task in external memory. Defaults to ``false``.
- All other options from :ref:`Microphone Component <config-microphone>`.

.. _resampler_microphone-channels:

Channels:
---------

The :ref:`config-microphone-source` selects which channels are resampled. Microphone source channels are always 0-indexed.
If you only resample one total channel from the source microphone, the resampler microphone will only have channel
0 available, regardless whether you resample the source mic's channel 0 or 1.

.. code-block:: yaml

    # Example of microphone source indexing
    microphone:
      - platform: resampler
        id: resampled_mic
        sample_rate: 16000
        microphone:
            microphone: source_mic
            channels: 1 # Only one total channel is resampled

    voice_assistant:
        microphone:
          microphone: resampled_mic
          channels: 0   # resampled_mic has only one total channel and its index is 0


Improving quality
-----------------

Resampling is processor intensive and should be avoided as much as possible. The audio quality is effected by the number of filters and the number of taps. Increasing the number of filters will increase the memory load. Increasing the number of taps will increase the CPU load.

See also
--------

- `ART Audio Resampler (GitHub) <https://github.com/dbry/audio-resampler>`__
- :doc:`index`
- :ghedit:`Edit`
