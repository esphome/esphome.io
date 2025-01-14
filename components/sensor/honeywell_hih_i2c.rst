Honeywell HumidIcon (I2C HIH series) Temperature & Humidity Sensor
==================================================================

.. seo::
    :description: Instructions for setting up Honeywell HumidIcon temperature and humidity sensors.
    :image: honeywellhih.jpg
    :keywords: Honeywell HIH

Honeywell HumidIcon (I2C HIH series) Temperature & Humidity sensors with ESPHome (`website <https://sps.honeywell.com/us/en/products/advanced-sensing-technologies/healthcare-sensing/humidity-with-temperature-sensors>`__,
`datasheet <https://prod-edam.honeywell.com/content/dam/honeywell-edam/sps/siot/en-us/products/sensors/humidity-with-temperature-sensors/common/documents/sps-siot-humidity-sensors-line-guide-009034-7-en-ciid-54931.pdf?download=false>`__).
The :ref:`I²C Bus <i2c>` is required to be set up in your configuration for this sensor to work.

Example sensors:

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: honeywell_hih_i2c
        temperature:
          name: "Living Room Temperature"
        humidity:
          name: "Living Room Humidity"

Configuration variables:
------------------------

- **temperature** (**Required**): The information for the temperature sensor.
  All options from :ref:`Sensor <config-sensor>`.

- **humidity** (**Required**): The information for the humidity sensor.
  All options from :ref:`Sensor <config-sensor>`.

- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``60s``.


See Also
--------

- :ref:`sensor-filters`
- :apiref:`honeywell_hih_i2c/honeywell_hih.h`
- :ghedit:`Edit`
