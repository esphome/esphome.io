``skip_initial``
****************

A simple skip filter; ``skip_initial: N`` skips the first ``N`` sensor readings and passes on the
rest. This can be used when the sensor needs a few readings to 'warm up'. After the initial
readings have been skipped, this filter does nothing.

.. code-block:: yaml

    # Example configuration entry
    - platform: wifi_signal
      # ...
      filters:
        - skip_initial: 3

