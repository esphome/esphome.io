Analog Threshold Binary Sensor
==============================

.. seo::
    :description: Instructions for setting up an analog threshold binary sensors.
    :image: analog_threshold.svg

The ``analog_threshold`` binary sensor platform allows you to convert analog values
(i.e. :doc:`sensor </components/sensor/index>` readings)
into boolean values, using a threshold as a reference.
When the signal is above or equal to the threshold the binary sensor is ``true``
(this behavior can be changed by adding an ``invert`` filter).

It provides an *hysteresis* option to reduce instability when the source signal is noisy
using different limits depending on the current state.
Additionally a :ref:`delay filter <binary_sensor-filters>` could be used to only change
after a new state has been kept a minimum time.

If the source sensor is uninitialized at the moment of component creation, the initial
state of the binary sensor wil be ``false``, if later it has some reading errors, those
invalid source updates will be ignored, and the binary sensor will keep it´s last state.

For example, below configuration would turn the readings of current sensor into
a binary sensor.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: analog_threshold
        name: "Garage Door Opening"
        sensor_id: motor_current_sensor
        threshold: 0.5


Configuration variables
-----------------------

-  **sensor_id** (**Required**, :ref:`config-id`): The ID of the source sensor.
-  **threshold** (**Required**, float or mapping): Configures the reference for comparison. Accepts either a shorthand
   float number that will be used as both upper/lower threshold, or a mapping to define different values for each (to
   use hysteresis).

   -  **upper** (**Required**, float): Upper threshold, that needs to be crossed to transition from ``low`` to ``high`` states.
   -  **lower** (**Required**, float): Lower threshold, that needs to be crossed to transition from ``high`` to ``low`` states.
-  All other options from :ref:`Binary Sensor <config-binary_sensor>`.



See Also
--------

- :doc:`/components/binary_sensor/index`
- :doc:`/components/sensor/index`
- :ref:`automation`
- :apiref:`analog_threshold/analog_threshold_binary_sensor.h`
- :ghedit:`Edit`
