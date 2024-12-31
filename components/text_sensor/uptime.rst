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

- **update_interval** (*Optional*, :ref:`config-time`): The sensor reporting interval. Defaults to ``60s``.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

See Also
--------
- :doc:`/components/sensor/uptime`
- :ref:`text_sensor-filters`
- :apiref:`uptime/uptime_text_sensor.h`
- :ghedit:`Edit`
