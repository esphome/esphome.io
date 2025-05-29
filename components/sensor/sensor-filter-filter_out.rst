``filter_out``
**************

(**Required**, number): Filter out specific values to be displayed, e.g., filtering out the value ``85.0``

.. code-block:: yaml

    # Example configuration entry
    - platform: wifi_signal
      # ...
      filters:
        - filter_out: 85.0

A list of values may be supplied, and values are templatable:


.. code-block:: yaml

    # Example configuration entry
    - platform: wifi_signal
      # ...
      filters:
        - filter_out:
            - 85.0
            - !lambda return id(some_sensor).state;


