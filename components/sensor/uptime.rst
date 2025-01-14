Uptime Sensor
=============

.. seo::
    :description: Instructions for setting up a sensor that tracks the uptime of the ESP.
    :image: timer.svg

The ``uptime`` sensor allows you to track the time the ESP has stayed up for in seconds.
Time rollovers are automatically handled.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: uptime
        type: seconds
        name: Uptime Sensor

Configuration variables:
------------------------

- **type** (*Optional*): Either:

  - ``seconds`` (*default*): A simple counter.
  - ``timestamp``: presents the time ESPHome last booted up. Requires a :doc:`/components/time/index`.

- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``60s``.
  Valid only with ``type: seconds``.
- All other options from :ref:`Sensor <config-sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :apiref:`uptime/uptime_sensor.h`
- :ghedit:`Edit`
