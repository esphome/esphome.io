Dallas PIO Switch
=================

.. seo::
    :description: Instructions for setting up Dallas 1-Wire PIO addressable switch as ESPHome switch
    :image: dallas_pio.jpg
    :keywords: Dallas, ds2413, ds2406, ds2408, onewire

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__),
`DS2406`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2406.pdf>`__),
`DS2408`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2408.pdf>`__)
and similar 1-Wire Dallas addressable switches PIO as ESPHome switch.  A :ref:`Dallas PIO <dallas_pio>` is
required to be set up in your configuration for this switch to work.

.. warning::

    **DS2408**: don't forget to put a pull up resistor to Vcc on the RSTZ pin to enable writing to ports P0 to P7 !  

Example Configuration
*********************

Below are configuration examples for different Dallas devices, including DS2408 with P0-P7 pin usage.

**Single DS2413 on One-Wire Bus**

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: dallas_pio
        name: ds2413 switch        # Friendly name for the switch
        dallas_pio_id: ds2413_ic1  # Reference to the Dallas PIO component
        id: ds2413_switch          # Optional ID for internal reference
        pin:
          number: PIOB             # Pin number: DS2413/DS2406 use PIOA/PIOB (2 pins), DS2408 uses P0-P7 (8 pins)
          mode:                    # Configuration of the pin's behavior
            output: true           # If set, must be true to output values to the pin
          inverted: true           # Hardware level inversion (true = active-low, false = active-high)
        inverted: false            # Logical level inversion of the switch state

**Multiple Devices (DS2413 and DS2408) on the Same Bus**

.. code-block:: yaml

    # Example configuration entry
    switch:
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

      - platform: dallas_pio
        name: ds2408 switch
        dallas_pio_id: ds2408_ic2
        id: ds2408_switch
        pin:
          number: P0
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

Options:
  - **number**: The pin to use. For DS2413 or DS2406, use `PIOA` or `PIOB`. For DS2408, use `P0` to `P7`.
  - **mode**: 
      - `output: true`: Configure the pin as an output (default and required for switch functionality)
      - `output: false`: Not allowed as switches must be able to control the pin state
  - **inverted**: Set to `true` to interpret a high signal as low (active-low). Useful for devices where a low voltage signifies an active state. Defaults to `false`.

- **inverted** (*Optional*, bool): Invert the logical state of the switch. When true, ON in ESPHome means OFF on the device and vice versa (default: false).
- All other options from :ref:`Switch <config-switch>`.

See Also
--------

- :apiref:`dallas_pio/switch.h`
- :ghedit:`Edit`
