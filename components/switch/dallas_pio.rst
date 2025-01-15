Dallas PIO Switch
=================

.. seo::
    :description: Instructions for setting up Dallas 1-Wire PIO adressable switch as ESPHome switch
    :image: dallas.jpg
    :keywords: Dallas, ds2413, ds2406, ds2408, onewire

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__),
`DS2406`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2406.pdf>`__),
`DS2408`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2408.pdf>`__)
and similar 1-Wire Dallas adressable switches PIO as ESPHome switch.  A :ref:`Dallas PIO <dallas_pio>` is
required to be set up in your configuration for this binary sensor to work.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: dallas_pio
        name: ds2413 switch
        dallas_pio_id: ds2413_ic1
        id: ds2413_switch
        pin:
          number: PIOB
          mode:
            output: true
          inverted: true
        inverted: false

Configuration variables:
************************

- **name** (*Optional*, string): The name for the sensor. At least one of **id** and **name** must be specified.
- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **dallas_pio_id** (*Required*, string): The ID of the dallas pio to use.
- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The PIO pin to use for the switch.
  PIOA, PIOB for DS2413 or DS2406 and P0 to P7 for DS2408.
- **inverted** (*Optional*, bool): Switch inverted if true (default false).
  Defaults to 1 second.
- All other options from :ref:`Switch <config-switch>`.

See Also
--------

- :apiref:`dallas_pio/switch.h`
- :ghedit:`Edit`
