Switch Component
================

.. seo::
    :description: Instructions for setting up generic switches in ESPHome.
    :image: folder-open.svg

The ``switch`` domain includes all platforms that should show up like a
switch and can only be turned ON or OFF.

.. _config-switch:

Base Switch Configuration
-------------------------

.. code-block:: yaml

    switch:
      - platform: ...
        name: "Switch Name"
        icon: "mdi:restart"

Configuration variables:

- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **name** (*Optional*, string): The name of the switch. At least one of **id** and **name** must be specified.

  .. note::

      If you have a :ref:`friendly_name <esphome-configuration_variables>` set for your device and
      you want the switch to use that name, you can set ``name: None``.

- **icon** (*Optional*, icon): Manually set the icon to use for the
  sensor in the frontend.
- **inverted** (*Optional*, boolean): Whether to invert the binary
  state, i.e. report ON states as OFF and vice versa. Defaults
  to ``false``.
- **internal** (*Optional*, boolean): Mark this component as internal. Internal components will
  not be exposed to the frontend (like Home Assistant). Only specifying an ``id`` without
  a ``name`` will implicitly set this to true.
- **restore_mode** (*Optional*): Control how the switch attempts to restore state on bootup.
  **NOTE** : Not all components consider **restore_mode**. Check the documentation of the specific component to understand how
  this feature works for a particular component or device.
  For restoring on ESP8266s, also see ``restore_from_flash`` in the
  :doc:`esp8266 section </components/esp8266>`.

    - ``RESTORE_DEFAULT_OFF`` - Attempt to restore state and default to OFF if not possible to restore.
    - ``RESTORE_DEFAULT_ON`` - Attempt to restore state and default to ON.
    - ``RESTORE_INVERTED_DEFAULT_OFF`` - Attempt to restore state inverted from the previous state and default to OFF.
    - ``RESTORE_INVERTED_DEFAULT_ON`` - Attempt to restore state inverted from the previous state and default to ON.
    - ``ALWAYS_OFF`` (Default) - Always initialize the switch as OFF on bootup.
    - ``ALWAYS_ON`` - Always initialize the switch as ON on bootup.
    - ``DISABLED`` - Does nothing and leaves it up to the downstream platform component to decide. For example, the component could read hardware and determine the state, or have a specific configuration option to regulate initial state.

  Unless a specific platform defines another default value, the default is ``ALWAYS_OFF``.

- **on_turn_on** (*Optional*, :ref:`Action <config-action>`): An automation to perform
  when the switch is turned on. See :ref:`switch-on_turn_on_off_trigger`.
- **on_turn_off** (*Optional*, :ref:`Action <config-action>`): An automation to perform
  when the switch is turned off. See :ref:`switch-on_turn_on_off_trigger`.
- **disabled_by_default** (*Optional*, boolean): If true, then this entity should not be added to any client's frontend,
  (usually Home Assistant) without the user manually enabling it (via the Home Assistant UI).
  Defaults to ``false``.
- **entity_category** (*Optional*, string): The category of the entity.
  See https://developers.home-assistant.io/docs/core/entity/#generic-properties
  for a list of available options.
  Set to ``""`` to remove the default entity category.
- **device_class** (*Optional*, string): The device class for the switch.
  See https://www.home-assistant.io/integrations/switch/#device-class
  for a list of available options.
- If MQTT enabled, All other options from :ref:`MQTT Component <config-mqtt-component>`.
- If Webserver enabled and version 3 is selected, All other options from Webserver Component.. See :ref:`Webserver Version 3 <config-webserver-version-3-options>`.

.. _switch-toggle_action:

``switch.toggle`` Action
************************

This action toggles a switch with the given ID when executed.

.. code-block:: yaml

    on_...:
      then:
        - switch.toggle: relay_1

.. _switch-turn_on_action:

``switch.turn_on`` Action
*************************

This action turns a switch with the given ID on when executed.

.. code-block:: yaml

    on_...:
      then:
        - switch.turn_on: relay_1

.. _switch-turn_off_action:

``switch.turn_off`` Action
**************************

This action turns a switch with the given ID off when executed.

.. code-block:: yaml

    on_...:
      then:
        - switch.turn_off: relay_1

.. _switch-is_on_condition:
.. _switch-is_off_condition:

``switch.is_on`` / ``switch.is_off`` Condition
**********************************************

This :ref:`Condition <config-condition>` checks if the given switch is ON (or OFF).

.. code-block:: yaml

    # In some trigger:
    on_...:
      if:
        condition:
          # Same syntax for is_off
          switch.is_on: my_switch

.. _switch-lambda_calls:

lambda calls
************

From :ref:`lambdas <config-lambda>`, you can call several methods on all switches to do some
advanced stuff (see the full API Reference for more info).

- ``publish_state()``: Manually cause the switch to publish a new state and store it internally.
  If it's different from the last internal state, it's additionally published to the frontend.

  .. code-block:: yaml

      // Within lambda, make the switch report a specific state
      id(my_switch).publish_state(false);
      id(my_switch).publish_state(true);

- ``state``: Retrieve the current state of the switch.

  .. code-block:: yaml

      // Within lambda, get the switch state and conditionally do something
      if (id(my_switch).state) {
        // Switch is ON, do something here
      } else {
        // Switch is OFF, do something else here
      }

- ``turn_off()``/``turn_on()``: Manually turn the switch ON/OFF from code.
  Similar to the ``switch.turn_on`` and ``switch.turn_off`` actions,
  but can be used in complex lambda expressions.

  .. code-block:: yaml

      id(my_switch).turn_off();
      id(my_switch).turn_on();
      // Toggle the switch
      id(my_switch).toggle();

.. _switch-on_turn_on_off_trigger:

``switch.on_turn_on`` / ``switch.on_turn_off`` Trigger
******************************************************

This trigger is activated each time the switch is turned on. It becomes active
right after the switch component has acknowledged the state (e.g. after it switched
ON/OFF itself).

.. code-block:: yaml

    switch:
      - platform: gpio  # or any other platform
        # ...
        on_turn_on:
        - logger.log: "Switch Turned On!"
        on_turn_off:
        - logger.log: "Switch Turned Off!"

See Also
--------

- :apiref:`switch/switch.h`
- :ghedit:`Edit`

.. toctree::
    :maxdepth: 1
    :glob:

    *
