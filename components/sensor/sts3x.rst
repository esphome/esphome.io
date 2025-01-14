STS3X Temperature Sensor
========================

.. seo::
    :description: Instructions for setting up STS3x-DIS temperature sensors
    :image: sts3x.jpg

The ``sts3x`` sensor platform Temperature sensor allows you to use your Sensirion STS30-DIS, STS31-DIS or STS35-DIS
(`datasheet <https://sensirion.com/media/documents/1DA31AFD/61641F76/Sensirion_Temperature_Sensors_STS3x_Datasheet.pdf>`__,
`Sensirion STS3x <https://www.sensirion.com/sts3x/>`__) sensors with
ESPHome. The :ref:`I²C Bus <i2c>` is
required to be set up in your configuration for this sensor to work.

.. figure:: images/temperature.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: sts3x
        name: "Living Room Temperature"
        address: 0x4A
        update_interval: 60s

Configuration variables:
------------------------

- **address** (*Optional*, int): Manually specify the I²C address of the sensor.
  Defaults to ``0x4A``.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Defaults to ``60s``.
- All other options from :ref:`Sensor <config-sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :doc:`dht`
- :doc:`dht12`
- :doc:`hdc1080`
- :doc:`htu21d`
- :doc:`sht3xd`
- :apiref:`sts3x/sts3x.h`
- :ghedit:`Edit`
