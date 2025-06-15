Interval Component
------------------

This component allows you to run actions at fixed time intervals. For example, if you want to toggle a switch every
minute, you can use this component. Please note that it's possible to achieve the same thing with the
:ref:`time.on_time <time-on_time>` trigger, but this technique is more light-weight and user-friendly.

.. code-block:: yaml

    # Example configuration entry
    interval:
      - interval: 1min
        then:
          - switch.toggle: relay_1


If a startup delay is configured, the first execution of the actions will not occur before at least that time after boot.

Configuration variables:
************************

- **interval** (**Required**, :ref:`config-time`): The interval to execute the action with.
- **startup_delay** (*Optional*, :ref:`config-time`): An optional startup delay - defaults to zero.
- **then** (**Required**, :ref:`Action <config-action>`): The action to perform.

See Also
--------

- :doc:`index`
- :doc:`/automations/actions`
- :doc:`/automations/templates`
- :ghedit:`Edit`
