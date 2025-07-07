Internal Temperature Sensor
===========================

.. seo::
    :description: Instructions for setting up the integrated temperature sensor of the ESP32, RP2040 and BK72XX.
    :image: thermometer.svg
    :keywords: esp32, rp2040, cpu, internal, temperature

The ``internal_temperature`` sensor platform allows you to use the integrated
temperature sensor of the ESP32, RP2040 and BK72XX chip.

.. note::

    Some ESP32 variants return a large amount of invalid temperature
    values, including 53.3°C which equates to a raw value of 128. Invalid measurements are ignored by this component.

.. figure:: images/internal_temperature-ui.png
    :align: center
    :width: 70.0%

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: internal_temperature
        name: "Internal Temperature"

Configuration variables:
------------------------

- **update_interval** (*Optional*, :ref:`config-time`): The interval
  to check the sensor. Defaults to ``60s``.
- All other options from :ref:`Sensor <config-sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :ghedit:`Edit`
