``offset``
**********

Adds a value to each sensor value. The value may be a constant or a lambda returning a float.

.. code-block:: yaml

    # Example configuration entry
    - platform: adc
      # ...
      filters:
        - offset: 2.0
        - multiply: 1.2
        - offset: !lambda return id(some_sensor).state;

