Uptime Text Sensor
==================

.. seo::
    :description: Instructions for setting up a text sensor that tracks the uptime of the ESP.
    :image: timer.svg

The ``uptime`` text sensor provides a human-readable representation the time since boot.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: uptime
        name: Uptime

Configuration variables:
------------------------

- **update_interval** (*Optional*, :ref:`config-time`): The sensor reporting interval. Defaults to ``30s``.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

The resolution of the reported uptime will be determined by the update interval. For example, if the update interval is set to 30 seconds (the default), the uptime will be reported in minutes. Faster updates will result in seconds being reported.


See Also
--------
- :doc:`/components/sensor/uptime`
- :ref:`text_sensor-filters`
- :apiref:`uptime/uptime_text_sensor.h`
- :ghedit:`Edit`
