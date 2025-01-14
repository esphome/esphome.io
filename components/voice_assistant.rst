Voice Assistant
===============

.. seo::
    :description: Instructions for setting up a Voice Assistant in ESPHome.
    :image: voice-assistant.svg

ESPHome devices with a microphone are able to stream the audio to Home Assistant and be processed there by `assist <https://www.home-assistant.io/voice_control/>`__.

.. note::

    Voice Assistant requires Home Assistant 2023.5 or later.

.. warning::

    Audio and voice components consume a significant amount of resources (RAM, CPU) on the device.

    **Crashes are likely to occur** if you include too many additional components in your device's
    configuration. In particular, Bluetooth/BLE components are known to cause issues when used in
    combination with Voice Assistant and/or other audio components.

Configuration:
--------------

.. code-block:: yaml

    microphone:
      - platform: ...
        id: mic_id

    voice_assistant:
      microphone: mic_id

- **microphone** (**Required**, :ref:`config-id`): The :doc:`microphone </components/microphone/index>` to use for input.
- **speaker** (*Optional*, :ref:`config-id`): The :doc:`speaker </components/speaker/index>` to use to output the response.
  Cannot be used with ``media_player`` below.
- **media_player** (*Optional*, :ref:`config-id`): The :doc:`media_player </components/media_player/index>` to use
  to output the response. Cannot be used with ``speaker`` above.
- **use_wake_word** (*Optional*, boolean): Enable wake word on the assist pipeline. Defaults to ``false``.
- **conversation_timeout** (*Optional*, :ref:`config-time`): How long to wait before resetting the ``conversation_id``
  sent to the voice assist pipeline, which contains the context of the current assist pipeline. Defauls to ``300s``.
- **on_intent_start** (*Optional*, :ref:`Automation <automation>`): An automation to perform when intent processing starts.
- **on_intent_end** (*Optional*, :ref:`Automation <automation>`): An automation to perform when intent processing ends.
- **on_listening** (*Optional*, :ref:`Automation <automation>`): An automation to
  perform when the voice assistant microphone starts listening.
- **on_start** (*Optional*, :ref:`Automation <automation>`): An automation to
  perform when the assist pipeline is started.
- **on_wake_word_detected** (*Optional*, :ref:`Automation <automation>`): An automation
  to perform when the assist pipeline has detected a wake word.
- **on_end** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when the voice assistant is finished all tasks.
- **on_stt_end** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when the voice assistant has finished speech-to-text. The resulting text is
  available to automations as the variable ``x``.
- **on_stt_vad_start** (*Optional*, :ref:`Automation <automation>`): An automation to perform when voice activity
  detection starts speech-to-text processing.
- **on_stt_vad_end** (*Optional*, :ref:`Automation <automation>`): An automation to perform when voice activity
  detection ends speech-to-text processing.
- **on_tts_start** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when the voice assistant has started text-to-speech. The text to be spoken is
  available to automations as the variable ``x``.
- **on_tts_end** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when the voice assistant has finished text-to-speech. A URL containing the audio response
  is available to automations as the variable ``x``.
- **on_tts_stream_start** (*Optional*, :ref:`Automation <automation>`): An automation to perform when audio stream
  (voice response) playback starts. Requires ``speaker`` to be configured.
- **on_tts_stream_end** (*Optional*, :ref:`Automation <automation>`): An automation to perform when audio stream
  (voice response) playback ends. Requires ``speaker`` to be configured.
- **on_idle** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when the voice assistant is idle (no other actions/states are in progress).
- **on_error** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when the voice assistant has encountered an error. The error code and message are available to
  automations as the variables ``code`` and ``message``.

- **on_client_connected** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when Home Assistant has connected and is waiting for Voice Assistant commands.
- **on_client_disconnected** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when Home Assistant disconnects from the Voice Assistant.

- **noise_suppression_level** (*Optional*, integer): The noise suppression level to apply to the assist pipeline.
  Between 0 and 4 inclusive. Defaults to 0 (disabled).
- **auto_gain** (*Optional*, dBFS): Auto gain level to apply to the assist pipeline.
  Between 0dBFS and 31dBFS inclusive. Defaults to 0 (disabled).
- **volume_multiplier** (*Optional*, float): Volume multiplier to apply to the assist pipeline.
  Must be larger than 0. Defaults to 1 (disabled).

- **on_timer_started** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a voice assistant
  timer has started. The timer is available as ``timer`` of type :apistruct:`voice_assistant::Timer`.
- **on_timer_finished** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a voice assistant
  timer has finished. The timer is available as ``timer`` of type :apistruct:`voice_assistant::Timer`.
- **on_timer_cancelled** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a voice assistant
  timer has been cancelled. The timer is available as ``timer`` of type :apistruct:`voice_assistant::Timer`.
- **on_timer_updated** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a voice assistant
  timer has been updated (paused/resumed/duration changed). The timer is available as ``timer`` of type :apistruct:`voice_assistant::Timer`.
- **on_timer_tick** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the voice assistant timers
  tick is triggered.
  This is called every **1 second** while there are timers on this device.
  The timers are available as ``timers`` which is a ``std::vector`` (array) of type :apistruct:`voice_assistant::Timer`.

.. _voice_assistant-actions:

Voice Assistant Actions
-----------------------

The following actions are available for use in automations:

``voice_assistant.start``
^^^^^^^^^^^^^^^^^^^^^^^^^

Listens for one voice command then stops.

Configuration variables:

- **silence_detection** (*Optional*, boolean): Enable silence detection. Defaults to ``true``.
- **wake_word** (*Optional*, string): The wake word that was used to trigger the voice assistant
  when using on-device wake word such as :doc:`/components/micro_wake_word`.

Call ``voice_assistant.stop`` to signal the end of the voice command if ``silence_detection`` is set to ``false``.


``voice_assistant.start_continuous``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Start listening for voice commands. This will start listening again after
the response audio has finished playing. Some errors will stop the cycle.
Call ``voice_assistant.stop`` to stop the cycle.


``voice_assistant.stop``
^^^^^^^^^^^^^^^^^^^^^^^^

Stop listening for voice commands.


Voice Assistant Conditions
--------------------------

The following conditions are available for use in automations:

- ``voice_assistant.is_running`` - Returns true if the voice assistant is currently running.
- ``voice_assistant.connected`` - Returns true if the voice assistant is currently connected to Home Assistant.

Wake word detection
-------------------

See our `example YAML files on GitHub <https://github.com/esphome/firmware/blob/main/voice-assistant/m5stack-atom-echo.yaml>`__ for continuous wake word detection.


Push to Talk
------------

Here is an example offering Push to Talk with a :doc:`/components/binary_sensor/index`.

.. code-block:: yaml

    voice_assistant:
      microphone: ...
      speaker: ...

    binary_sensor:
      - platform: gpio
        pin: ...
        on_press:
          - voice_assistant.start:
              silence_detection: false
        on_release:
          - voice_assistant.stop:

Click to Converse
-----------------

.. code-block:: yaml

    voice_assistant:
      microphone: ...
      speaker: ...

    binary_sensor:
      - platform: gpio
        pin: ...
        on_click:
          - if:
              condition: voice_assistant.is_running
              then:
                - voice_assistant.stop:
              else:
                - voice_assistant.start_continuous:


See Also
--------

- :doc:`microphone/index`
- :apiref:`voice_assistant/voice_assistant.h`
- :ghedit:`Edit`
