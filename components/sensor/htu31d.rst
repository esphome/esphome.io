HTU31D Temperature & Humidity Sensor
=====================================================

.. seo::
    :description: Instructions for setting up HTU31D temperature and humidity sensors.
    :image: htu31d.jpg
    :keywords: HTU31D

The HTU31D Temperature & Humidity component allows you to use HTU31D sensors with
ESPHome. The :ref:`I²C Bus <i2c>` is required to be set up in your configuration for this sensor to work.


Example sensors:

- (`Adafruit <https://www.adafruit.com/product/4832>`__)

.. figure:: images/htu31d.jpg
    :align: center
    :width: 50.0%

    HTU31D Temperature & Humidity Sensor. Image by `Adafruit`_.

.. _Adafruit: https://www.adafruit.com/product/4832

.. figure:: images/temperature-humidity.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: htu31d
        temperature:
          name: "Temperature"
        humidity:
          name: "Humidity"

Configuration variables:
------------------------

- **temperature** (*Optional*): The information for the temperature sensor.
  All options from :ref:`Sensor <config-sensor>`.

- **humidity** (*Optional*): The information for the humidity sensor.
  All options from :ref:`Sensor <config-sensor>`.

- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``60s``.

See Also
--------

- :ref:`sensor-filters`
- :doc:`absolute_humidity`
- :doc:`htu21d`
- :doc:`dht`
- :doc:`dht12`
- :doc:`hdc1080`
- :doc:`sht3xd`
- :apiref:`htu31d/htu31d.h`
- `i2cdevlib <https://github.com/jrowberg/i2cdevlib>`__ by `Jeff Rowberg <https://github.com/jrowberg>`__
- :ghedit:`Edit`
