LPS22 Barometric Pressure Sensor
================================

.. seo::
    :description: Instructions for setting up LPS22 barometric pressure sensor

The ``lps22`` sensor platform  allows you to use your LPS22HB or LPS22HH pressure sensor
(`datasheet <https://www.st.com/resource/en/application_note/an4672-lps22hblps25hb-digital-pressure-sensors-hardware-guidelines-for-system-integration-stmicroelectronics.pdf>`__) with ESPHome.

The :ref:`I²C Bus <i2c>` is required to be set up in your configuration for this sensor to work.

.. figure:: images/lps22.jpg
    :align: center

.. code-block:: yaml

    sensor:
      - platform: lps22
        temperature:
          name: "LPS22 Temperature"
        pressure:
          name: "LPS22 Pressure"

Configuration variables:
------------------------

- **temperature** (*Optional*): Temperature.

  - All options from :ref:`Sensor <config-sensor>`.

- **pressure** (*Optional*): Barometric Pressure.

  - All options from :ref:`Sensor <config-sensor>`.

- **address** (*Optional*, int): Manually specify the I²C address of the sensor. Default is ``0x5d``. ``0x5c`` is another common address.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``60s``.

Sensor sampling details:
------------------------

The LPS22 sensors support variety of sampling and streaming approaches: periodic at various
frequencies from 1Hz to 75Hz, as well as single-shot sampling mode. Single-shot sampling is
implemented in this component letting the sensor to enter the power-down mode between samples,
saving significant power.

See Also
--------

- :ref:`sensor-filters`
- :apiref:`lps22/lps22.h`
- :ghedit:`Edit`
