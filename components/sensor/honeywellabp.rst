Honeywell ABP Pressure Sensors
==============================

.. seo::
    :description: Instructions for setting up Honeywell ABP Pressure sensors
    :image: honeywellabp.jpg
    :keywords: Honeywell ABP

The ``honeywellabp`` sensor platform allows you to use your Honeywell ABP
(`website <https://sps.honeywell.com/us/en/products/sensing-and-iot/sensors/pressure-sensors/board-mount-pressure-sensors/basic-abp-series>`__,
`datasheet <https://prod-edam.honeywell.com/content/dam/honeywell-edam/sps/siot/en-us/products/sensors/pressure-sensors/board-mount-pressure-sensors/basic-abp-series/documents/sps-siot-basic-board-mount-pressure-abp-series-datasheet-32305128-ciid-155789.pdf?download=false>`__,
`Mouser <https://www.mouser.ca/new/honeywell/honeywell-abp-pressure-sensors/>`_) pressure and temperature sensors with ESPHome. The :ref:`SPI <spi>` is
required to be set up in your configuration for this sensor to work

.. figure:: images/honeywellabp.jpg
    :align: center
    :width: 50.0%

    Honeywell ABP Pressure and Temperature Sensor.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: honeywellabp
        pressure:
          name: Honeywell pressure
          min_pressure: 0
          max_pressure: 15
        temperature:
          name: Honeywell temperature
        cs_pin: GPIOXX

Configuration variables:
------------------------

The values for ``min_pressure`` and ``max_pressure`` can be found in the device datasheet for the specific device. These are used to calculate
the pressure reading published by the sensor. Some sensors measure pressure in ``bar`` or ``kPa``; set ``min_pressure`` and ``max_pressure`` to
the measurement range and ``unit_of_measurement`` to the appropriate unit for your device.

- **pressure** (*Optional*): The information for the pressure sensor.

  - **min_pressure** (**Required**, int or float): Minimum pressure for the pressure sensor, default unit ``psi``.
  - **max_pressure** (**Required**, int or float): Maximum pressure for the pressure sensor, default unit ``psi``.
  - All other options from :ref:`Sensor <config-sensor>`.

Some sensors do not have temperature sensing ability, see datasheet. In some cases the sensor may return a valid temperature even though the
datasheet indicates that the sensor does not measure temperature.

- **temperature** (*Optional*): The information for the temperature sensor.

  - All options from :ref:`Sensor <config-sensor>`.


- **cs_pin** (**Required**, :ref:`SPI <spi>`): Chip select pin.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Defaults to ``60s``.

See Also
--------

- :ref:`sensor-filters`
- :apiref:`honeywellabp/honeywellabp.h`
- :ghedit:`Edit`
