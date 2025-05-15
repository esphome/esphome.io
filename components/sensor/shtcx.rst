SHTCx Temperature+Humidity Sensors
==================================

.. seo::
    :description: Instructions for setting up SHTC1 and SHTC3 temperature and humidity sensors
    :image: shtc3.jpg

The ``shtcx`` sensor platform Temperature+Humidity sensor allows you to use your Sensirion SHTC1
(`datasheet <https://sensirion.com/media/documents/21BF77EA/63A5A411/Datasheet_SHTC1.pdf>`__,
`Sensirion STHC1 <https://www.sensirion.com/en/environmental-sensors/humidity-sensors/digital-humidity-sensor-for-consumer-electronics-and-iot/>`__) and
the newer SHTC3
(`datasheet <https://sensirion.com/media/documents/643F9C8E/63A5A436/Datasheet_SHTC3.pdf>`__,
`SparkFun`_ ) sensors with
ESPHome. The :ref:`I²C Bus <i2c>` is
required to be set up in your configuration for this sensor to work.

.. _SparkFun: https://www.sparkfun.com/products/15074

.. figure:: images/temperature-humidity.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: shtcx
        temperature:
          name: "Temperature"
        humidity:
          name: "Humidity"

Configuration variables:
------------------------

- **temperature** (*Optional*): The information for the temperature sensor.

  - All options from :ref:`Sensor <config-sensor>`.

- **humidity** (*Optional*): The information for the humidity sensor.

  - All options from :ref:`Sensor <config-sensor>`.

- **address** (*Optional*, int): Manually specify the I²C address of the sensor.
  Defaults to ``0x70``.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Defaults to ``60s``.

See Also
--------

- :ref:`sensor-filters`
- :doc:`absolute_humidity`
- :doc:`dht`
- :doc:`dht12`
- :doc:`hdc1080`
- :doc:`htu21d`
- :doc:`sht3xd`
- :apiref:`shtcx/shtcx.h`
- :ghedit:`Edit`
