Dallas PIO Binary Sensor
========================

.. seo::
    :description: Instructions for setting up Dallas 1-Wire PIO adressable switch as ESPHome binary sensor
    :image: dallas.jpg
    :keywords: Dallas, ds2413, ds2406, ds2408, onewire

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__)
and similar 1-Wire PIO binary sensors.  A :ref:`1-Wire bus <one_wire>` is
required to be set up in your configuration for this sensor to work.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: dallas_pio
        address: 0xfe10055073e122ba
        name: ds2413 binary sensor test
        id: ds2413_binary_sensor_test
        pin:
          number: PIOA
          mode:
            input: true
          inverted: true  
        dallas_pio_id: ds2413_ic1
        update_interval: 1s

Configuration variables:
************************

- **address** (*Optional*, int): The address of the sensor. Required if there is more than one device on the bus.
- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The
  PIO pin to use for the switch.
- **update_interval** (*Optional*, :ref:`config-time`): The interval that the binary sensors should be checked.
  Defaults to 1 second.
- **dallas_pio_id** (*Optional*, string): The ID of the dallas pio to use.
- All other options from :ref:`Binary Sensor <config-binary-sensor>`.

See Also
--------

- :apiref:`dallas_pio/binary_sensor.h`
- :ghedit:`Edit`
