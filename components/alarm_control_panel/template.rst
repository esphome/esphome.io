Template Alarm Control Panel
============================

.. seo::
    :description: Instructions for setting up template Alarm Control Panels in ESPHome.
    :image: description.svg

The ``template`` alarm control panel platform allows you to turn your binary sensors into a state machine
managed alarm control panel.

.. code-block:: yaml

    # Example configuration entry
    alarm_control_panel:
      - platform: template
        name: Alarm Panel
        codes:
          - "1234"
        binary_sensors:
          - input: zone_1
          - input: zone_2
            bypass_armed_home: true

Configuration variables:
------------------------

- **codes** (*Optional*, list of string): A list of codes for disarming the alarm, if *requires_code_to_arm* is set to true then for arming the alarm too.
- **requires_code_to_arm** (*Optional*, boolean): A code required for arming the alarm. **codes** must be defined.
- **arming_away_time** (*Optional*, :ref:`config-time`): The exit delay when the alarm is armed to away mode. Defaults to ``0s``.
- **arming_home_time** (*Optional*, :ref:`config-time`): The exit delay when the alarm is armed to home mode.
- **arming_night_time** (*Optional*, :ref:`config-time`): The exit delay when the alarm is armed to night mode.
- **pending_time** (*Optional*, :ref:`config-time`): The entry delay before the alarm is triggered. Defaults to ``0s``.
- **trigger_time** (*Optional*, :ref:`config-time`): The time after a triggered alarm before resetting to previous state if the sensors are cleared/off. Defaults to ``0s``.
- **binary_sensors** (*Optional*, *list*): A list of binary sensors the panel should use as zones. Each consists of:

  - **input** (**Required**, string): The id of the binary sensor component
  - **bypass_armed_home** (*Optional*, boolean): This binary sensor will not trigger the alarm when in ``armed_home`` state.
  - **bypass_armed_night** (*Optional*, boolean): This binary sensor will not trigger the alarm when in ``armed_night`` state.
  - **bypass_auto** (*Optional*, boolean): This binary sensor will be automatically bypassed if faulted at the time of arming.
  - **trigger_mode** (*Optional*, string): Sets the trigger mode for this sensor. One of ``delayed``, ``delayed_follower``, ``instant`` or ``instant_always``. (``delayed`` is the default if not specified)
  - **chime** (*Optional*, boolean): The chime callback will be called whenever the sensor goes from ``OFF`` to ``ON``.

- **restore_mode** (*Optional*, enum):

  - ``ALWAYS_DISARMED`` (Default): Always start in ``DISARMED`` state.
  - ``RESTORE_DEFAULT_DISARMED``: Restore state or default to ``DISARMED`` state if no saved state was found.

- All other options from :ref:`Alarm Control Panel <config-alarm_control_panel>`

.. note::

    If ``binary_sensors`` is omitted then you're expected to trigger the alarm using
    :ref:`alarm_control_panel_pending_action` or :ref:`alarm_control_panel_triggered_action`.

.. _template_alarm_control_panel-trigger_modes:

Trigger Modes
-------------

A binary sensor acts as a zone for the alarm. The sensor is *faulted*, and will potentially trigger the alarm, when it changes to the ``ON`` state.
In some circumstances, a sensor may be bypassed and will not trigger the alarm when faulted.

Each binary sensor/zone must be in one of the following trigger modes:

- instant
- instant_always
- delayed *(the default)*
- delayed_follower

The ``instant`` trigger mode will immediately trigger the alarm, unless it is in the ``DISARMED`` state.
The ``instant`` trigger mode is typically used for exterior zones (e.g. windows, and glass break detectors).

The ``instant_always`` trigger mode will immediately trigger the alarm, independent of the current state.
The ``instant_always`` trigger mode is typically used for continuously monitored zones (e.g. smoke detectors).

The ``delayed`` trigger mode provides a delay period before the armed alarm is triggered, allowing for it to be disarmed in the interim.
The ``delayed`` trigger mode is typically specified for exterior doors where entry is required to access an alarm keypad or other arm/disarm method.
This is the default trigger mode if not otherwise specified.

The ``delayed_follower`` trigger mode allows for the definition of a path through the premises from a ``delayed``
entry zone, through ``delayed_follower`` zones,  to a point where the alarm  may be disarmed, such as an alarm keypad or other arm/disarm method.
This is typically also the path out of the premises when the alarm is armed.
If the premises is entered via the ``delayed`` entry zone then the alarm enters the ``PENDING`` state and any
``delayed_follower`` zone faults are ignored.
If the premises is not entered via the ``delayed`` entry zone then the ``delayed_follower`` zone behaves as though it
were an ``instant`` zone.

.. _template_alarm_control_panel-state_flow:

State Flow:
-----------

1. The alarm starts in ``DISARMED`` state.
2. When in the ``DISARMED`` state and the ``arm_...`` method is invoked:

  - If ``arming_..._time`` is greater than zero the next state is ``ARMING``.
  - If ``arming_..._time`` is zero the next state is ``ARMED_...``.

  The ``arm_...`` method does not allow arming from states other than ``DISARMED``.

3. When in the ``ARMING`` state, after the ``arming_..._time`` delay the next state is ``ARMED_...``.

4. The alarm can be triggered by a faulted zone:

  1. If **trigger_mode** is set to ``instant``:

    - If the current state is not ``DISARMED`` the next state is ``TRIGGERED``.
    - If the current state is ``DISARMED`` the fault is ignored and the alarm will stay in that
      state.

  2. If **trigger_mode** is set to ``instant_always``:

    - The next state is ``TRIGGERED``.

  3. If **trigger_mode** is set to ``delayed``:

    - If the current state is ``ARMED_...``:

      - If **pending_time** greater than 0 the next state is ``PENDING``.
      - If **pending_time** is 0 the next state is ``TRIGGERED``.

    - If the current state is not ``ARMED_...`` the fault is ignored and the alarm will stay in that
      state.

  4. If the **trigger_mode** is set to ``delayed_follower``:

    - If the current state is ``ARMED_...`` the next state is ``TRIGGERED``.
    - If the current state is not ``ARMED_...`` the fault is ignored and the alarm will stay in that
      state.

  Bypassed zones do not trigger state transitions.

5. When in the ``PENDING`` state, after the **pending_time** delay the next state is ``TRIGGERED``.

6. When in the ``TRIGGERED`` state, if **trigger_time** greater than zero and no zones are faulted after **trigger_time**
   delay the state returns to the preceding ``ARMED_...`` state.

Other state transitions may be forced by ``alarm_control_panel`` actions, such as the
:ref:`alarm_control_panel_pending_action` or the :ref:`alarm_control_panel_triggered_action`, and of course the
:ref:`alarm_control_panel_disarm_action` which disarms the alarm.

.. note::

    Although the interface supports all arming modes only ``away``, ``home`` and ``night`` have been implemented for now.

    ``arm_...`` means one of ``arm_away``, ``arm_home`` or ``arm_night``.

    **arming_..._time** means one of **arming_away_time**, **arming_home_time**, or **arming_night_time**.

    ``ARMED_...`` means one of ``ARMED_AWAY``, ``ARMED_HOME``, or ``ARMED_NIGHT``.


Example:
--------

.. code-block:: yaml

    alarm_control_panel:
      platform: template
      name: Alarm Panel
      id: acp1
      codes:
        - "1234"
      requires_code_to_arm: true
      arming_away_time: 30s
      arming_home_time: 5s
      pending_time: 30s
      trigger_time: 5min
      binary_sensors:
        - input: zone_1
          chime: true
          trigger_mode: delayed
        - input: zone_2
          chime: true
          trigger_mode: delayed
        - input: zone_3
          bypass_armed_home: true
          trigger_mode: delayed_follower
        - input: zone_4
          trigger_mode: instant
        - input: ha_test
      on_state:
        then:
          - lambda: !lambda |-
              ESP_LOGD("TEST", "State change %s", alarm_control_panel_state_to_string(id(acp1)->get_state()));
      on_triggered:
        then:
          - switch.turn_on: siren
      on_cleared:
        then:
          - switch.turn_off: siren
      on_ready:
        then:
         - lambda: !lambda |-
             ESP_LOGD("TEST", "Sensor ready change to: %s",
               (id(acp1).get_all_sensors_ready())) ? (const char *) "True" : (const char *) "False");
      on_chime:
        then:
         - lambda: !lambda |-
             ESP_LOGD("TEST", "Zone with chime mode set opened");

    binary_sensor:
      - platform: gpio
        id: zone_1
        name: Zone 1
        device_class: door
        pin:
          number: GPIOXX
          mode: INPUT_PULLUP
          inverted: True
      - platform: gpio
        id: zone_2
        name: Zone 2
        device_class: door
        pin:
          number: GPIOXX
          mode: INPUT_PULLUP
          inverted: True
      - platform: gpio
        id: zone_3
        name: Zone 3
        device_class: motion
        pin:
          number: GPIOXX
          mode: INPUT_PULLUP
          inverted: True
      - platform: gpio
        id: zone_4
        name: Zone 4
        device_class: door
        pin:
          number: GPIOXX
          mode: INPUT_PULLUP
          inverted: True
      - platform: homeassistant
        id: ha_test
        name: HA Test
        entity_id: input_boolean.test_switch

    switch:
      - platform: gpio
        id: siren
        name: Siren
        icon: mdi:alarm-bell
        pin: GPIOXX


See Also
--------

- :doc:`index`
- :doc:`/components/binary_sensor/index`
- :apiref:`template/alarm_control_panel/template_alarm_control_panel.h`
- :ghedit:`Edit`
