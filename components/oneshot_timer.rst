Oneshot Timer Component
=======================

This component implements a timer that triggers an action after a specified period of time. When the
timer expires it does not restart automatically. The timer can be restarted by invoking a :ref:`oneshot_timer.start`
action. During its operation, the timer can also be paused and resumed.

.. code-block:: yaml

    # Example configuration entry
    oneshot_timer:
      - interval: 1min
        auto_start: true
        on_timeout:
          then:
            - switch.toggle: switch


Configuration variables:
------------------------

- **interval** (**Required**, :ref:`config-time`): The interval after which the timer expires.
- **auto_start** (*Optional*, boolean): Whether or not to start the timer immediately when the device boots up.
- **on_timeout** (**Required**, :ref:`Action <config-action>`): The action to perform when the timer expires.
- **on_start** (*Optional*, :ref:`Action <config-action>`): An action to perform when the timer has started. The action
  will be triggered only when the timer switches from paused or stopped state to running state.
- **on_pause** (*Optional*, :ref:`Action <config-action>`): An action to perform when the timer is paused. The action
  will be triggered only when the timer switches from running state to paused state.

```

```oneshot_timer.start``` Action`:
----------------------------------

Starts the timer. If the timer is already running, the action won't have any effect. The action can be invoked
in one of two ways:

1. With an interval specification. In this case, the timer will start with the specified interval:

.. code-block:: yaml

    on_...:
      then:
        - oneshot_timer.start:
            id: timer_id
            interval: 10s

2. Without an interval specification. In this case, the timer will start with the interval specified in its main configuration.

.. code-block:: yaml

    on_...:
      then:
        - oneshot_timer.start: timer_id

Configuration options:

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the timer if you have multiple components.
- **interval** (*Optional*, :ref:`config-time`, :ref:`templatable <config-templatable>`): A new interval with which to initialize the timer.



```oneshot_timer.pause``` and ```oneshot_timer.resume``` Actions:
-----------------------------------------------------------------

These two actions allow the user to pause the timer operation without resetting the countdown. When the
```oneshot_timer.resume``` action is called, the timer would continue from the point it was paused. Calling
```oneshot_timer.resume``` on an expired timer has no effect.

Configuration options:

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the timer if you have multiple components.


Querying the timer state
------------------------

A timer can be queried for its state. A timer object exposes two functions for that purpose:

- ```bool running()``` - Returns true if the timer is running, false otherwise (paused or expired).
- ```uint32_t remaining_time()``` - Returns the remaining time in the timer, in milliseconds. If the
  timer has expired, the function returns 0.

Example:

.. code-block:: yaml

  on_...:
    then:
      - logger.log:
        format: "Timer is %s, remaining time %umS"
          args:
            - 'id(timer_id).running()? "running" : "paused"'
            - 'id(timer_id).remaining_time()'

See Also
--------

- :doc:`index`
- :doc:`/automations/actions`
- :doc:`/automations/templates`
- :ghedit:`Edit`
