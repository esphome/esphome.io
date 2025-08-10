HDC302x Temperature and Humidity Sensor
===================================

.. seo::
    :description: Instructions for setting up HDC302x temperature and humidity sensor for use with ESPHome.
    :image: hdc302x.jpg
    :keywords: HDC3020, HDC3021, HDC3022

The `hdc302x` sensor platform allows you to use your HDC302x temperature and humidity sensor
(`datasheet <https://www.ti.com/lit/ds/symlink/hdc3020.pdf>`__,
`Adafruit <https://www.adafruit.com/product/5989>`__) with ESPHome.

The :ref:`I²C Bus <i2c>` is required to be set up in your configuration for this sensor to work.

.. figure:: images/hdc302x.jpg
    :align: center
    :width: 80.0%

.. _Adafruit: https://www.adafruit.com/product/5989

.. code-block:: yaml

    sensor:
      - platform: hdc302x
        temperature:
          name: "Temperature"
        humidity:
          name: "Relative Humidity"
        update_interval: 60s

Configuration variables:
------------------------

- **temperature** (*Optional*): Temperature.

  - All options from :ref:`Sensor <config-sensor>`.

- **humidity** (*Optional*): Relative Humidity.

  - All options from :ref:`Sensor <config-sensor>`.

- **power_mode** (*Optional*, enum): The Power Mode used when triggering temperature and humidity readings. This
  affects the accuracy of readings and the power usage of the sensor.

  - ``HIGH_ACCURACY`` (Default): Low Power Mode 0 - Highest accuracy, slower, higher power usage.
  - ``BALANCED``
  - ``LOW_POWER``
  - ``ULTRA_LOW_POWER``: Low Power Mode 3 - Lowest power usage, faster, less accuracy.

- **heater** (*Optional*, boolean): If true, enable the relative humidity sensor's integrated heater.
  *Note: This will significantly impact temperature readings.*

- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``60s``.

Heater Configuration:
---------------------

The HDC302X includes an integrated heater in the relative humidity sensor, which is intended to remove condensation
from the sensor in high humidity environments. This can help maintain accurate humidity measurements.

The heater can be enabled by setting ``heater`` to ``true``. This will run the heater with the default sensor settings.

See the (`datasheet <https://www.ti.com/lit/ds/symlink/hdc3020.pdf>`__) for more information about heater operation.

See Also
--------

- :doc:`/components/sensor/sht4x`
- :doc:`/components/sensor/hdc1080`
- :ref:`sensor-filters`
- :doc:`absolute_humidity`
- :apiref:`hdc302x/hdc302x.h`
- :ghedit:`Edit`
