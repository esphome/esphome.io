Pulse Width Sensor
==================

.. seo::
    :description: Instructions for setting up pulse width accumulation sensors 
    in ESPHome to measure total on-time of GPIO inputs for MOSFETs and TRIACs


The ``pulse_width_accumulate`` sensor allows you to sum the total on-time of 
a GPIO input. For example, this can be used to externally measure the on-time 
of a rapidly switched MOSFET or TRIAC. The sensor zeros itself every polling 
interval.  Units of measurement are on-time seconds per update interval.
An optional frequency sensor is also provided.

.. Note::

    Threshold stability values were experimentally determined for an ESP32 DevKit-v4:
   - Minimum pulse width: ≥ 25 µs
   - Minimum pulse width delay: ≥ 75 µs
   - Maximum implied frequency: ~10 kHz
   - Maximum polling window: 71.58 minutes (see text below)         

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

  1. The polling function resets the microsecond counter to prevent overflow at 71.58 minutes
  2. Sensor accuracy is a function of the input signal frequency: 
    - Test Condition #1 (25 µs pulses, 75 µs delay, 1 sec polling, 27380 samples):
      * Frequency. Expected 10 kHz. Observed mean 9980.5 Hz. Standard deviation=5.5 Hz
      * On-time. Expected based on time stamps 6846.75 s. Observed 6844.33 s
    - Test Condition #2 (300 µs pulses, 300 µs delay, 1 min polling, 289 samples):
      * Frequency, expected 1666.67 Hz, Observed mean 1666.57 Hz, standard deviation=0.08 Hz
      * On-time. Expected based on time stamps 8640 s. Observed 8639.98 s  
      

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

