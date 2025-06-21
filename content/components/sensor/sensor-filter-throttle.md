``throttle``
************

Throttle the incoming values. When this filter gets an incoming value,
it checks if the last incoming value is at least ``specified time period`` old.
If it is not older than the configured value, the value is not passed forward.

.. code-block:: yaml

    # Example filters:
    filters:
      - throttle: 1s
      - heartbeat: 5s
      - debounce: 0.1s
      - delta: 5.0
      - lambda: return x * (9.0/5.0) + 32.0;

