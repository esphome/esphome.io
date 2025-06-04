Pulse Meter Sensor
==================

.. seo::
    :description: Instructions for setting up pulse meter sensors.
    :image: pulse.svg

The pulse meter sensor allows you to count the number and frequency of pulses on any pin. It is intended to be a drop-in replacement
for the :doc:`pulse counter component </components/sensor/pulse_counter>`.
Rather than counting pulses over a fixed time interval, the pulse meter sensor measures the time between pulses. The precise manner in which this is done depends on the ``internal_filter_mode`` option. This leads to a higher resolution, especially for low pulse rates, as the pulse counter sensor is limited by the number of pulses within a time interval.

Here's a comparison of the two sensors.  The pulse meter is the smoother line.  Both are set to an update interval of 10 seconds (using the ``update_interval`` and the ``throttle_average`` option respectively):

.. figure:: /images/pulse-counter_vs_pulse-meter.png
    :align: center
    :width: 50.0%

Please note that it is not possible to use both of these two sensors on the same pin at the same time.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: pulse_meter
        pin: GPIOXX
        name: "Pulse Meter"

Configuration variables
------------------------

- **pin** (**Required**, :ref:`config-pin`): The pin to count pulses on.

- **internal_filter** (*Optional*, :ref:`config-time`): If a pulse shorter than this   time is detected, it is discarded. Defaults to ``13us``.

  This acts as a debounce filter to eliminate input noise, so choose a value a little less than your expected minimum pulse width.

- **internal_filter_mode** (*Optional*, string): Determines how the internal filter is applied.
  One of ``EDGE`` or ``PULSE``. Defaults to ``EDGE``.
  - In ``EDGE``  mode, subsequent rising edges are compared and if they fall into an interval lesser than the ``internal filter`` value, the last one is discarded. This is useful if your input signal bounces, but is otherwise clean.
  - In ``PULSE`` mode, the rising edge is discarded if any further interrupts are detected before the ``internal_filter`` time has passed. In other words, a high pulse must be at least ``internal_filter`` long to be counted. This is useful if you have a noisy input signal that may have bounces before and/or after the main pulse.

- **timeout** (*Optional*, :ref:`config-time`): If we don't see a pulse for this length of time, we assume *0 pulses/s*. Defaults to ``5 min``.
- **total** (*Optional*, :ref:`config-id`): An additional sensor that outputs the total number of pulses counted.
- All other options from :ref:`Sensor <config-sensor>`.

Converting units
----------------

The sensor defaults to units of *pulses/min*, You can change this by using :ref:`sensor-filters`.
For example, if you're using the pulse meter with a photodiode to count the light pulses on a power meter that has an impulse constant of *10000 pulses / kWh*, you can use the following to output instantaneous usage in *W*:

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: pulse_meter
        name: 'Electricity Usage'
        id: sensor_pulse_meter # Optional ID, necessary if you want to calculate the total number of pulses.
        unit_of_measurement: 'W'
        device_class: power
        state_class: measurement
        internal_filter: 20ms # Assuming maximum load of 16 kW and 10000 impulses per kWh, any pulses faster than 22.5 ms would exceed load. -10% ~= 20 ms.
        accuracy_decimals: 0
        pin: GPIOXX
        filters:
          - multiply: 6 # (60s / impulse constant) * (1000W / 1kW)

Counting total pulses
---------------------

When the total sensor is configured, ``pulse_meter`` also reports the total
number of pulses measured.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: pulse_meter
      # ...
        total:
          name: "Total Pulses"

(Re)Setting the total pulse count
---------------------------------

Using this action, you are able to reset/set the total pulse count. This can be useful
if you would like the ``total`` sensor to match what you see on your meter you are
trying to match.

.. code-block:: yaml

    api:
      actions:
        - action: set_total
          variables:
            new_total: int
          then:
            - pulse_meter.set_total_pulses:
                id: sensor_pulse_meter
                value: !lambda 'return new_total;'

.. note::

    This value is the raw count of pulses, and not the value you see after the filters

See Also
--------

- :ref:`sensor-filters`
- :doc:`/components/sensor/pulse_counter`
- :doc:`/components/sensor/total_daily_energy`
- :doc:`/cookbook/power_meter`
- `Home Assistant Glow 🌟 <https://github.com/klaasnicolaas/home-assistant-glow/>`__.
- :apiref:`pulse_meter/pulse_meter_sensor.h`
- :ghedit:`Edit`
