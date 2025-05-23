``timeout``
************

After the first value has been sent, if no subsequent value is published within the
``specified time period``, send a templatable value which defaults to ``NaN``.
Especially useful when data is derived from some other communication
channel, e.g. a serial port, which can potentially be interrupted.

.. code-block:: yaml

    # Example filters:
    filters:
      - timeout: 10s  # sent value will be NaN
      - timeout:
          timeout: 10s
          value: !lambda return 0;

