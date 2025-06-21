Speaker Components
==================

.. seo::
    :description: Instructions for setting up speakers in ESPHome.
    :image: speaker.svg

The ``speaker`` domain contains common functionality shared across the
speaker platforms.

.. _config-speaker:

Base Speaker Configuration
--------------------------

.. code-block:: yaml

    speaker:
      - platform: ...


Configuration variables:

- **audio_dac** (*Optional*, :ref:`config-id`): The :doc:`audio DAC </components/audio_dac/index>` to use for volume control.

.. _speaker-actions:

Speaker Actions
---------------

All ``speaker`` actions can be used without specifying an ``id`` if you have only one ``speaker`` in
your configuration YAML.

.. _speaker-play:

``speaker.play`` Action
^^^^^^^^^^^^^^^^^^^^^^^

This action will start playing raw audio data from the speaker.

.. code-block:: yaml

    on_...:
      # Static raw audio data
      - speaker.play: [...]

      # Templated, return type is std::vector<uint8_t>
      - speaker.play: !lambda return {...};

      # in case you need to specify the speaker id
      - speaker.play:
          id: my_speaker
          data: [...]

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to control. Defaults to the only one in YAML.
- **data** (**Required**, list of bytes): The raw audio data to play.

.. _speaker-stop:

``speaker.stop`` Action
^^^^^^^^^^^^^^^^^^^^^^^

This action will stop playing audio data from the speaker and discard the unplayed data.

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to control. Defaults to the only one in YAML.

.. _speaker-finish:

``speaker.finish`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^

This action will stop playing audio data from the speaker after all data **is** played.

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to control. Defaults to the only one in YAML.

.. _speaker-mute_on:

``speaker.mute_on`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will mute the speaker.

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to control. Defaults to the only one in YAML.

.. _speaker-mute_off:

``speaker.mute_off`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will unmute the speaker.

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to control. Defaults to the only one in YAML.

.. _speaker-volume_set:

``speaker.volume_set`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will set the volume of the speaker.

.. code-block::

    on_...:
      # Simple
      - speaker.volume_set: 50%

      # Full
      - speaker.volume_set:
          id: speaker_id
          volume: 50%

      # Simple with lambda
      -  speaker.volume_set: !lambda "return 0.5;"

Configuration variables:

**volume** (**Required**, percentage): The volume to set the speaker to.

.. _speaker-conditions:

Speaker Conditions
---------------------

All ``speaker`` conditions can be used without specifying an ``id`` if you have only one ``speaker`` in
your configuration YAML.

.. _speaker-is_playing:

``speaker.is_playing`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition will check if the speaker is currently playing audio data.

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to check. Defaults to the only one in YAML.

.. _speaker-is_stopped:

``speaker.is_stopped`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition will check if the speaker is fully stopped audio data and is in idle mode.

.. note:

Between the time ``speaker.is_playing`` is false and ``speaker.is_stopped`` is true the 'speaker' component is closing down structures that where used to play the data correctly. *It better to check if the speaker is stopped then that if it plays.*

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The speaker to check. Defaults to the only one in YAML.


Platforms
---------

.. toctree::
    :maxdepth: 1
    :glob:

    *

See Also
--------

- :doc:`/guides/audio_clips_for_i2s`
- :doc:`/components/speaker/i2s_audio`
- :ghedit:`Edit`
