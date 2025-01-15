Dallas PIO Binary Sensor
========================

.. seo::
    :description: Instructions for setting up Dallas 1-Wire PIO adressable switch as ESPHome binary sensor
    :image: dallas.jpg
    :keywords: Dallas, ds2413, ds2406, ds2408, onewire

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__),
`DS2406`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2406.pdf>`__),
`DS2408`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2408.pdf>`__)
and similar 1-Wire Dallas adressable switches PIO as ESPHome binary sensors.  A :ref:`Dallas PIO <dallas_pio>` is
required to be set up in your configuration for this binary sensor to work.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: dallas_pio
        name: ds2413 binary sensor
        id: ds2413_binary_sensor
        pin:
          number: PIOA
          mode:
            input: true
          inverted: true  
        dallas_pio_id: ds2413_ic1
        update_interval: 1s

Configuration variables:
************************

- **name** (*Optional*, string): The name for the sensor. At least one of **id** and **name** must be specified.
- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The PIO pin to use for the switch.
  PIOA, PIOB for DS2413 or DS2406 and P0 to P7 for DS2408.
- **update_interval** (*Optional*, :ref:`config-time`): The interval that the binary sensors should be checked.
  Defaults to 1 second.
- **dallas_pio_id** (*Optional*, string): The ID of the dallas pio to use.
- All other options from :ref:`Binary Sensor <config-binary-sensor>`.

See Also
--------

- :apiref:`dallas_pio/binary_sensor.h`
- :ghedit:`Edit`
