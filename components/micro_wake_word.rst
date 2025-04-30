Micro Wake Word
================

.. seo::
    :description: Instructions for creating a custom wake word using microWakeWord.
    :image: voice-assistant.svg

ESPHome implements an on-device wake word detection framework from `microWakeWord <https://github.com/kahrendt/microWakeWord>`__.
This repository/library allows you to create a custom wake word for your ESPHome device.

The training process is described on the `microWakeWord GitHub repository <https://github.com/kahrendt/microWakeWord>`__.


.. code-block:: yaml

    # Shorthand name
    micro_wake_word:
      models:
        - model: okay_nabu

    # Github shorthand URL
    micro_wake_word:
      models:
        - model: github://esphome/micro-wake-word-models/models/v2/okay_nabu.json

Configuration variables:
------------------------

- **microphone** (**Required**, :ref:`config-microphone-source`): The :doc:`microphone </components/microphone/index>` settings to use for input.
- **models** (**Required**, list): The models to use.

  - **model** (**Required**, string): This can be one of:

        - A simple name of a model that exists in the official `ESPHome Models repository <https://github.com/esphome/micro-wake-word-models>`__.
          e.g. ``okay_nabu``.
        - A github shorthand URL to a model JSON file.
          e.g. ``github://esphome/micro-wake-word-models/models/okay_nabu.json@main``.
        - A full URL to a model JSON file.
          e.g. ``https://github.com/esphome/micro-wake-word-models/raw/main/models/okay_nabu.json``.

  - **probability_cutoff** (*Optional*, percentage): The probability cutoff for the wake word detection.
    If the probability of the wake word is below this value, the wake word is not detected.
    A larger value reduces the number of false accepts but increases the number of false rejections.
  - **sliding_window_size** (*Optional*, int): The size of the sliding window average for the wake word detection. A small value lowers latency but may increase the number of false accepts.
- **on_wake_word_detected** (*Optional*, Automation): An automation to perform when the wake word is detected.
  The ``wake_word`` phrase from the model manifest is provided as a ``std::string`` to any actions in this automation.
- **vad** (*Optional*, model): Enable a Voice Activity Detection model to reduce false accepts from non-speech sounds.

  - **model** (*Optional*, string): This can be one of:

        - A github shorthand URL to a model JSON file.
          e.g. ``github://esphome/micro-wake-word-models/models/v2/vad.json@main``.
        - A full URL to a model JSON file.
          e.g. ``https://github.com/esphome/micro-wake-word-models/raw/main/models/v2/vad.json``.

  - **probability_cutoff** (*Optional*, percentage): The probability cutoff for voice activity detection.
    If the probability is below this value, then no wake word will be accepted.
    A larger value reduces the number of false accepts but increases the number of false rejections.
  - **sliding_window_size** (*Optional*, int): The size of the sliding window average for voice activity detection. The average probability is compared to ``probability_cutoff`` to determine if voice activity is detected.


The ``probability_cutoff`` and ``sliding_window_size`` are provided by the JSON file but can be overridden in YAML. A default VAD model is provided with the ``vad`` configuration variables, but a different model can be overridden in YAML.


Automations
-----------

``micro_wake_word.start`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Starts the wake word detection.

``micro_wake_word.stop`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Stops the wake word detection.

Example usage
-------------

.. code-block:: yaml

    micro_wake_word:
      microphone:
        microphone: ...
        channels: 0
        gain_factor: 4
      vad:
      models:
        - model: okay_nabu
        - model: hey_mycroft
      on_wake_word_detected:
        then:
          - voice_assistant.start:
              wake_word: !lambda return wake_word;


Model JSON
----------

.. code-block:: json

    {
      "type": "micro",
      "wake_word": "okay nabu",
      "author": "Kevin Ahrendt",
      "website": "https://www.kevinahrendt.com/",
      "model": "stream_state_internal_quant.tflite",
      "version": 2,
      "micro": {
        "probability_cutoff": 0.97,
        "sliding_window_size": 5,
        "feature_step_size": 10,
        "tensor_arena_size": 22860,
        "minimum_esphome_version": "2024.7"
      }
    }

The model JSON file contains the following fields that are all **required** unless otherwise specified:

- **type** (string): The type of the model. This should always be ``micro``.
- **wake_word** (string): The wake word that the model is trained to detect.
- **author** (string): The name of the author that trained the model.
- **website** (*optional* string): The website of the author.
- **model** (string): The relative or absolute path or URL to the TFLite trained model file.
- **trained_languages** (list of strings): A list of the wake word samples' primary languages/pronunciations used when training.
- **version** (int): The version of the JSON schema. The current version is ``2``.
- **micro** (object): The microWakeWord specific configuration.

  - **probability_cutoff** (float): The probability cutoff for the wake word detection.
    If the probability of the wake word is below this value, the wake word is not detected.
  - **sliding_window_size** (int): The size of the sliding window for the wake word detection. Wake words average all probabilities in the sliding window and VAD models use the maximum of all probabilities in the sliding window.
  - **feature_step_size** (int): The step size for the spectrogram feature generation in milliseconds.
  - **tensor_arena_size** (int): The minimum size of the tensor arena in bytes.
  - **minimum_esphome_version** (version): The minimum ESPHome version required to use this model.


See Also
--------

- :doc:`voice_assistant`
- :apiref:`micro_wake_word/micro_wake_word.h`
- :ghedit:`Edit`
