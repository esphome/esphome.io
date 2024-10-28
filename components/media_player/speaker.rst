Speaker Audio Media Player
==========================

.. seo::
    :description: Instructions for setting up a speaker media player in ESPHome.
    :image: speaker.svg

The ``speaker`` media player platform allows you to play local and online audio media via :doc:`/components/speaker/index`.

This platform requires PSRAM and the :ref:`esp32-espidf_framework`. It is designed to run an ESP32-S3. It may work on other ESP32 variants, with potentially decreased performance.

It natively supports decoding ``WAV``, ``MP3``, and ``FLAC`` audio files. Home Assistant (since version 2024.10) will proxy any media it sends and transcode it to FLAC at the configured sample rate to minimize the device's computational load.

It supports two different audio streams: media and announcement. If both streams are active, they will be mixed together for playback. Use the ``speaker_media_player.set_ducking`` action to lower the volume of the media stream. :ref:`Media player actions <media_player-actions>` only affect the media stream. Use the ``speaker_media_player.stop_stream`` action to stop an announcement.

Local files built directly into the firmware are played without a network connection. Encode local files with the configured sample rate, 1 or 2 channels, and 16 bits per sample. If the file is encoded at a different sample rate, a slow low-quality resampler is used.

.. code-block:: yaml

    # Example minimal configuration entry
    media_player:
      - platform: speaker
        speaker: speaker_id

Configuration variables:
------------------------

- **speaker** (**Required**, :ref:`config-id`): The :doc:`speaker </components/speaker/index>` to output the audio.
- **sample_rate** (*Optional*, positive integer): Sample rate to output the media. Should be supported by configured ``speaker`` component. Defaults to ``16000``.
- **volume_increment** (*Optional*, percentage): Increment amount that the ``media_player.volume_up`` and ``media_player.volume_down`` actions will increase or decrease volume by. Defaults to ``5%``.
- **volume_min** (*Optional*, percentage): The minimum volume allowed. Defaults to ``0%``.
- **volume_max** (*Optional*, percentage): The maximum volume allowed. Defaults to ``100%``.
- **files** (*Optional*, list): A list of media files to build into the firmware for local playback.
    - **id** (**Required**, :ref:`config-id`): Unique ID for the file.
    - **file** (**Required**, string): Path to audio file. Can be a local file path or a URL.
- **on_mute** (*Optional*, :ref:`Automation <automation>`): An automation to perform when muted.
- **on_unmute** (*Optional*, :ref:`Automation <automation>`): An automation to perform when unmuted.
- **on_volume** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the volume is changed.
- All other options from :ref:`Media Player <config-media_player>`


Automations
-----------

.. _speaker_media_player-play_local_media_file:

``speaker_media_player.play_local_media_file`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will play a local media file.

.. code-block::

    on_...:
      # Simple
      - speaker_media_player.play_local_media_file: file_id

      # Full
      - speaker_media_player.play_local_media_file:
          media_file: wake_word_trigger_sound
          announcement: true

Configuration variables:

- **media_file** (**Required**, :ref:`config-id`): The ID of the media file.
- **announcement** (*Optional*, boolean): Whether to play back the file as an announcement or media stream. Defaults to ``false``.

.. _speaker_media_player-stop_stream:

``speaker_media_player.stop_stream`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will stop either the media or announcement stream immediately.

.. code-block::

    on_...:
      - speaker_media_player.stop_stream: announcement

Configuration variables:

- **stream** (**Required**, enum): Which audio stream to stop. One of ``announcement`` or ``media``.

.. _speaker_media_player-set_ducking:

``speaker_media_player.set_ducking`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action ducks (reduces the volume) of the media stream.

.. code-block::

    on_...:
      - speaker_media_player.set_ducking:
          decibel_reduction: 20
          duration: 2.0s

Configuration variables:

- **decibel_reduction** (**Required**, int, templatable): The reduction of the media stream in decibels. Must be between 0 and 51.
- **duration** (*Optional*, :ref:`config-time`, templatable): The length of time to transition between the current reduction level and the new reduction level. Defaults to ``0s``.

Detailed Example
----------------

This example outputs audio to an  :doc:`I²S Audio Speaker </components/speaker/i2s_audio>` configured with a 48000 Hz sample rate. It adds a switch for playing a local file for an alarm notification. Any playing media is ducked while the alarm is activated. After the alarm is turned off, the media ducking will gradually stop.

.. code-block:: yaml

    i2s_audio:
        i2s_lrclk_pin: GPIOXX
        i2s_bclk_pin: GPIOXX

    speaker:
      - platform: i2s_audio
        id: speaker_id
        dac_type: external
        i2s_dout_pin: GPIOXX
        sample_rate: 48000

    media_player:
      - platform: speaker
        name: "Speaker Media Player"
        id: speaker_media_player_id
        speaker: speaker_id
        sample_rate: 48000
        files:
          - id: alarm_sound
            file: alarm.flac # Placed in the yaml directory. Should be encoded with a 48000 Hz sample rate, mono or stereo audio, and 16 bits per sample.

    switch:
      - platform: template
        name: "Ring Timer"
        id: timer_ringing
        optimistic: true
        restore_mode: ALWAYS_OFF
        on_turn_off:
            # Stop playing the alarm
            - speaker_media_player.stop_stream: announcement
            # Stop ducking the media stream over 2 seconds
            - speaker_media_player.set_ducking:
                decibel_reduction: 0
                duration: 2.0s
        on_turn_on:
            # Duck media audio by 20 decibels instantly
            - speaker_media_player.set_ducking:
                decibel_reduction: 20
                duration: 0.0s
            - while:
                condition:
                    switch.is_on: timer_ringing
                then:
                    # Play the alarm sound as an announcement
                    - speaker_media_player.play_local_media_file:
                        media_file: alarm_sound
                        announcement: true
                    # Wait until the alarm sound starts playing
                    - wait_until:
                        media_player.is_announcing:
                    # Wait until the alarm sound stops playing
                    - wait_until:
                        not:
                          media_player.is_announcing:

See also
--------

- :doc:`/components/speaker/index`
- :doc:`index`
- :ghedit:`Edit`
