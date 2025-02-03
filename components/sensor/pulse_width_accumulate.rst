Pulse Width Sensor
==================

.. seo::
    :description: Instructions for setting up pulse width accumulation sensors 
    in ESPHome to measure total on-time of GPIO inputs for MOSFETs and TRIACs


The ``pulse_width_accumulate`` sensor allows you to sum the total on-time of 
a GPIO input. For example, this can be used to externally measure the total on-time 
of a rapidly switched MOSFET or TRIAC. The sensor zeros itself every polling 
interval.  Units of measurement are on-time seconds per update interval.
An optional frequency sensor is also provided.

.. Note::

    Threshold stability values were experimentally determined for an ESP32 DevKit-v4:
   - Minimum pulse width: 25 µs
   - Minimum pulse width delay: 75 µs
   - Maximum implied frequency: ~10 kHz
   - Maximum pulse width: infinite 
   - Maximum polling time: <71.58 minutes (see text below) 
   - Minimum polling time: 1 second        

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: pulse_width_accumulate
        pin: GPIO32
        name: Cumulative on-time sensor
        frequency:
          name: Average frequency sensor


.. note::

  Important implementation details:

  1. Both Falling-edge-interrupts, and the polling function reset the microsecond 
  counter preventing overflow at 71.58 minutes. 
  2. Sensor accuracy is determined by the input signal frequency, for example: 
    - Test Condition #1 (25 µs pulses, 75 µs delay, 1 sec polling, 20379 samples):
      * Frequency. Expected 10 kHz. Observed mean 9998.2 Hz. Standard deviation=0.9 Hz
      * On-time. Expected based on time stamps 5094.25 s. Observed 5094.87 s (see figure below)
    - Test Condition #2 (300 µs pulses, 300 µs delay, 1 sec polling, 15333 samples):
      * Frequency, expected 1666.67 Hz, Observed mean 1666.57 Hz, standard deviation=0.50 Hz
      * On-time. Expected based on time stamps 7666 s. Observed 7665.97 s  
    - Test Condition #3 (random 1s to 10 min pulses, random 1 s to 1 min delay, 1 min polling, 289 samples):
      * On-time. Expected based on generation algorighm 8640 s. Observed 8639.98 s 

.. figure:: images/kernel_25.png
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

