Pulse Width Sensor
==================

.. seo::
    :description: Instructions for setting up pulse width sensors in ESPHome
    :image: pulse.svg

The ``pulse_width_accumulate`` sensor allows you to sum the total on-time of 
a GPIO input. For example, this can be used to externally measure the on-time 
of rapidly switched MOSFET or TRIAC. The sensor zeros itself every polling 
interval, and units of measurement are on-time seconds per update interval.
An optional frequency sensor is also provided.

.. Note::

    Threshold stability values were experimentally determined for an esp32 devkit_v4. 
    Pulse width >= 22 microseconds, pulse width delay >= 70 microseconds 
    (ie. implied maximum frequency ~10.87 KHz)
    There are no overflow problems ie. the pulse width can be infinitely long. 
    However, the polling window (default 1 minute) must not be set > 71.58 minutes.         

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: pulse_width_accumulate
        pin: GPIO32
        name: Cumulative on-time sensor
        frequency:
          name: aAverage frequency sensor


.. note::

    The polling function also resets the microsecond counter preventing overflow 
    at 71.58 min.  A peculiarity of the current Interrupt synchronization is the 
    occasional sensor skip of one or more polling periods.  The sensor  
    remains accurate because the accumulated time is pushed forward to the next 
    polling period.  The graph below shows the sensor output under stressed 
    conditions (22 microsecond pulses with a pulse width delay of 70 microseconds
    and an update period of 1 second).  
    Although the majority of readings are as expected 22/92=0.239 seconds, a number 
    of zero, and consecutive zero readings are pushed forward.  Polling 
    misses are less common with polling intervals >=1 min (~0.4% chance). However,
    be warned that excessive polling periods >15 min may risk overflow.

.. figure:: images/22_70_kernel_density.png
    :align: center
    :width: 80.0%

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
- :apiref:`pulse_width_accumulate/pulse_width_accumulate.h`
- :apiref:`pulse_width/pulse_width.h`
- :apiref:`pulse_meter/pulse_meter_sensor.h`
- :ghedit:`Edit`

