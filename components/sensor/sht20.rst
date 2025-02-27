SHT20 Temperature+Humidity Sensor
=================================

.. seo::
    :description: Instructions for setting up SHT20 temperature and humidity sensors
    :keywords: sht20

The ``sht20`` Temperature+Humidity sensor allows you to use your SHT20
(`datasheet <https://sensirion.com/resource/datasheet/sht20>`__,
`Sensirion`_) I²C-based sensor with ESPHome. The :ref:`I²C Bus <i2c>`
is required to be set up in your configuration for this sensor to work.

.. _Sensirion: https://sensirion.com/products/catalog/SHT20/

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: sht20
        temperature:
          name: "Greenhouse Temperature"
        humidity:
          name: "Greenhouse Humidity"
        update_interval: 60s

Configuration variables:
------------------------

- **temperature** (**Required**): The information for the temperature sensor.

  - All options from :ref:`Sensor <config-sensor>`.

- **humidity** (**Required**): The information for the humidity sensor

  - All options from :ref:`Sensor <config-sensor>`.

- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``60s``.


See Also
--------

- :ref:`sensor-filters`
- :doc:`absolute_humidity`
- :apiref:`sht20/sht20.h`
- :ghedit:`Edit`
