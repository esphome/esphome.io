Pulse Width Sensor
==================

.. seo::
    :description: Instructions for setting up pulse width sensors in ESPHome
    :image: pulse.svg

The ``pulse_width`` sensor allows you to measure how long a given digital signal
is HIGH. For example this can be used to measure PWM signals to transmit some
value over a simple protocol. The unit of measurement for this sensor is seconds.

.. note::

    This component is intended for measurements in the microsecond to seconds range! 
    The largest period this component can measure is just over 70 minutes.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: pulse_width
        pin: D0
        name: Pulse Width Sensor

Configuration variables:
------------------------

- **pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin to observe for the
  pulse width.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor.
  Defaults to ``60s``.

- **id** (*Optional*, :ref:`config-id`): Set the ID of this sensor for use in lambdas.
- All other options from :ref:`Sensor <config-sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :apiref:`pulse_width/pulse_width.h`
- :ghedit:`Edit`
