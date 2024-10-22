Slow PWM Output
===============

.. seo::
    :description: Instructions for setting up slow pwm outputs for GPIO pins.
    :image: pwm.png

Similar to PWM, the Slow PWM Output platform allows you to control GPIO pins by
pulsing them on/off over a longer time period. It could be used to control a
heating element through a relay where a fast PWM update cycle would not be appropriate.

.. note::

    This is for **slow** PWM output. For fast-switching PWM outputs (for example,
    lights), see these outputs:

    - ESP32: :doc:`ledc`
    - ESP8266: :doc:`esp8266_pwm`

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: slow_pwm
        pin: GPIOXX
        id: my_slow_pwm
        period: 15s


Configuration variables:
------------------------

- **id** (**Required**, :ref:`config-id`): The id to use for this output component.
- **period** (**Required**, :ref:`config-time`): The duration of each cycle. (i.e. a 10s
  period at 50% duty would result in the pin being turned on for 5s, then off for 5s)
- **pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin to pulse.
- **state_change_action** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the load is switched. If a lambda is used the boolean ``state`` parameter holds the new status.
- **turn_on_action** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the load is turned on. Can be used to control for example a switch or output component.
- **turn_off_action** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the load is turned off. ``turn_on_action`` and ``turn_off_action`` must be configured together.
- **restart_cycle_on_state_change** (*Optional*, boolean): Restart a timer of a cycle
  when new state is set. Defaults to ``false``.
- **min_time_on** (*Optional*, :ref:`config-time`): The minimum duration that the load has to be on in each cycle. If a small level value implies that the load should be on for less than this
  time, the current cycle will be extended to observe the level, but to keep the load on for long enough. Useful when controlling valves which are slow to open, for example. If the level is 0, the
  cycle is unaffected. Defaults to `0ms`.
- **min_time_off** (*Optional*, :ref:`config-time`): The minimum duration that the load has to be off in each cycle. If a large level value implies that the load should be off for less than this
  time, the current cycle will be extended to observe the level, but to keep the load off for long enough. Useful when controlling valves which are slow to close, for example. If the level is 1, the
  cycle is unaffected. Defaults to `0ms`.
- **max_period** (*Optional*, :ref:`config-time`): When ``min_time_on`` or ``min_time_off`` are used, prevent the cycle from extending indefinitely for very low or very high levels. If used, the
  set level will not be observed in case ``min_time_on/max_period`` is larger than the set level or in case ``min_time_off/max_period`` is larger than ``(1-level)``. If not set, the cycle can extend
  indefinitely.

- All other options from :ref:`Output <config-output>`.


.. note::

    - If ``pin`` is defined the GPIO pin state is writen before any action is executed.
    - ``state_change_action`` and ``turn_on_action``/``turn_off_action`` can be used togther. ``state_change_action`` is called before ``turn_on_action``/``turn_off_action``. It's recommended to use either ``state_change_action`` or ``turn_on_action``/``turn_off_action`` to change the state of an output. Using both automations together is only recommended for monitoring.


Example:
--------

.. code-block:: yaml


    output:
      - platform: slow_pwm
        id: my_slow_pwm
        period: 15s
        turn_on_action:
          - lambda: |-
              auto *out1 = id(output1);
              out1->turn_on();
        turn_off_action:
          - output.turn_off: output1


.. note::

    If the duty cycle is not constrained to a maximum value, the
    :doc:`/components/output/sigma_delta_output` component offers faster updates and
    greater control over the switching frequency. This is better for loads that
    need some time to fully change between on and off, like eletric thermal
    actuator heads or fans.

Manipulating minimum state times
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: yaml


    output:
      - platform: slow_pwm
        id: time_constrained_slow_pwm
        period: 3s
        min_time_on: 1s
        min_time_off: 1s
        max_period: 5s


In this example

- when the output level is set to ``0.5``, the load will turn on for 1.5 seconds and then off for 1.5 seconds
- when the output level is set to ``0.25``, the load will turn on for ``min_time_on``, which is 1 second, but then to compensate and observe the 25% level, the load will turn off for another 3 seconds
- when the output level is set to ``0.75``, the load will turn on for 3 seconds, in order to compensate and observe the 25% level, then the load will turn off for another ``min_time_off`` which is 1 second
- when the output level is set to ``0.1``, the load will turn on for ``min_time_on`` 1 second, but it will fail to follow the set level (meaning a cycle period of 10 seconds), as the ``max_period`` states that it can only be off for another 4 seconds
- when the output level is set to ``0.9``, the load will turn on for 4 seconds, in order to respect the ``max_period``, then it will turn off for ``min_time_off`` which is 1 second, unable to respect the set level

See Also
--------

- :doc:`/components/output/index`
- :doc:`/components/output/esp8266_pwm`
- :doc:`/components/output/ledc`
- :doc:`/components/output/sigma_delta_output`
- :doc:`/components/light/monochromatic`
- :doc:`/components/fan/speed`
- :doc:`/components/power_supply`
- :apiref:`slow_pwm/slow_pwm_output.h`
- :ghedit:`Edit`
