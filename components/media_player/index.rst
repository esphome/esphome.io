Media Player Components
=======================

.. seo::
    :description: Instructions for setting up generic media players in ESPHome.
    :image: folder-open.svg

The ``media_player`` domain includes all platforms that implement media player
functionality.

.. note::

    ESPHome media players require Home Assistant 2022.6 or newer.

.. _config-media_player:

Base Media Player Configuration
-------------------------------

.. code-block:: yaml

    media_player:
      - platform: ...
        name: "Media Player Name"

Configuration variables:

- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **name** (*Optional*, string): The name of the media player. At least one of **id** and **name** must be specified.

  .. note::

      If you have a :ref:`friendly_name <esphome-configuration_variables>` set for your device and
      you want the media player to use that name, you can set ``name: None``.

- **icon** (*Optional*, icon): Manually set the icon to use for the
  media player in the frontend.
- **internal** (*Optional*, boolean): Mark this component as internal. Internal components will
  not be exposed to the frontend (like Home Assistant). Only specifying an ``id`` without
  a ``name`` will implicitly set this to true.
- **disabled_by_default** (*Optional*, boolean): If true, then this entity should not be added to any client's frontend,
  (usually Home Assistant) without the user manually enabling it (via the Home Assistant UI).
  Defaults to ``false``.
- **entity_category** (*Optional*, string): The category of the entity.
  See https://developers.home-assistant.io/docs/core/entity/#generic-properties
  for a list of available options. Set to ``""`` to remove the default entity category.

Media Player Actions
--------------------

All ``media_player`` actions can be used without specifying an ``id`` if you have only one ``media_player`` in
your configuration YAML.

Configuration variables:

**id** (*Optional*, :ref:`config-id`): The media player to control. Defaults to the only one in YAML.


.. _media_player-play:

``media_player.play`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will resume playing the media player.

.. _media_player-play_media:

``media_player.play_media`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will start playing the specified media.

.. code-block::

    on_...:
      # Simple
      - media_player.play_media: 'http://media-url/media.mp3'

      # Full
      - media_player.play_media:
          id: media_player_id
          media_url: 'http://media-url/media.mp3'

      # Simple with lambda
      - media_player.play_media: !lambda 'return "http://media-url/media.mp3";'

Configuration variables:

**media_url** (**Required**, string): The media url to play.

.. _media_player-pause:

``media_player.pause`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action pauses the current playback.

.. _media_player-stop:

``media_player.stop`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action stops the current playback.

.. _media_player-toggle:

``media_player.toggle`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will pause or resume the current playback.

.. _media_player-volume_up:

``media_player.volume_up`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will increase the volume of the media player.

.. _media_player-volume_down:

``media_player.volume_down`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will decrease the volume of the media player.

.. _media_player-volume_set:

``media_player.volume_set`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will set the volume of the media player.

.. code-block::

    on_...:
      # Simple
      - media_player.volume_set: 50%

      # Full
      - media_player.volume_set:
          id: media_player_id
          volume: 50%

      # Simple with lambda
      - media_player.volume_set: !lambda "return 0.5;"

Configuration variables:

**volume** (**Required**, percentage): The volume to set the media player to.

.. _media_player-on_state_trigger:

``media_player.on_state`` Trigger
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This trigger is activated each time the state of the media player is updated
(for example, if the player is stop playing audio or received some command).

.. code-block:: yaml

    media_player:
      - platform: i2s_audio  # or any other platform
        # ...
        on_state:
          - logger.log: "State updated!"

.. _media_player-on_play_trigger:

``media_player.on_play`` Trigger
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This trigger is activated each time then the media player is started playing.

.. code-block:: yaml

    media_player:
      - platform: i2s_audio  # or any other platform
        # ...
        on_play:
          - logger.log: "Playback started!"

.. _media_player-on_pause_trigger:

``media_player.on_pause`` Trigger
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This trigger is activated every time the media player pauses playback.

.. code-block:: yaml

    media_player:
      - platform: i2s_audio  # or any other platform
        # ...
        on_pause:
          - logger.log: "Playback paused!"

.. _media_player-on_idle_trigger:

``media_player.on_idle`` Trigger
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This trigger is activated every time the media player finishes playing.

.. code-block:: yaml

    media_player:
      - platform: i2s_audio  # or any other platform
        # ...
        on_idle:
          - logger.log: "Playback finished!"

.. _media_player-on_announcement_trigger:

``media_player.on_announcement`` Trigger
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This trigger is activated every time the media player plays an announcement.

.. code-block:: yaml

    media_player:
      - platform: i2s_audio  # or any other platform
        # ...
        on_announcement:
          - logger.log: "Announcing!"

.. _media_player-is_idle_condition:

``media_player.is_idle`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition checks if the media player is idle.

.. code-block:: yaml

    # In some trigger:
    on_...:
      if:
        condition:
          media_player.is_idle:

.. _media_player-is_playing_condition:

``media_player.is_playing`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition checks if the media player is playing media.

.. code-block:: yaml

    # In some trigger:
    on_...:
      if:
        condition:
          media_player.is_playing:

.. _media_player-is_paused_condition:

``media_player.is_paused`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition checks if the media player is paused.

.. code-block:: yaml

    # In some trigger:
    on_...:
      if:
        condition:
          media_player.is_paused:

.. _media_player-is_announcing_condition:

``media_player.is_announcing`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition checks if the media player is playing an announcement.

.. code-block:: yaml

    # In some trigger:
    on_...:
      if:
        condition:
          media_player.is_announcing:

Play media in order
-------------------

You can use wait automation to play files one after the other:

.. code-block:: yaml

    # In some trigger:
    on_...:
      then:
        - media_player.play_media: 'http://media-url/one.mp3'
        - wait_until:
            media_player.is_idle:
        - media_player.play_media: 'http://media-url/two.mp3'

See Also
--------

.. toctree::
    :maxdepth: 1
    :glob:

    *

- :ghedit:`Edit`
