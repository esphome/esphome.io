M5Stack KMeterISO I2C K-Type probe temperature sensor
=====================================================

.. seo::
    :description: Instructions for setting up KMeterISO temperature sensors
    :image: kmeteriso.jpg
    :keywords: BME280

The ``kmeteriso`` sensor platform allows you to use your KMeterISO
(`product <https://docs.m5stack.com/en/unit/KMeterISO%20Unit>`__,
`M5Stack`_) K-Type thermocouple temperature sensor with ESPHome.
The :ref:`I²C <i2c>` is required to be set up in your configuration
for this sensor to work.

.. figure:: ../../images/kmeteriso.jpg
    :align: center
    :width: 50.0%

    M5Stack KMeterISO temperature sensor.

.. _M5Stack: https://docs.m5stack.com/en/unit/KMeterISO%20Unit

.. code-block:: yaml

    # Example configuration entry
    sensor:
    - platform: kmeteriso
      temperature:
        name: Temperature
      internal_temperature:
        name: Internal temperature

Configuration variables:
------------------------

- **temperature** (*Optional*): The information for the temperature sensor. All options from :ref:`Sensor <config-sensor>`.
- **internal_temperature** (*Optional*): The information for the temperature sensor inside the probe. All options from :ref:`Sensor <config-sensor>`.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Defaults to ``5s``.

See Also
--------

- :ref:`sensor-filters`
- :doc:`absolute_humidity`
- :apiref:`kmeteriso/kmeteriso.h`
- `M5Stack Unit code <https://github.com/m5stack/M5Unit-KMeterISO>`__ by `M5Stack <https://m5stack.com/>`__
- :ghedit:`Edit`
