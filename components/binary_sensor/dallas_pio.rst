Dallas PIO Binary Sensor
========================

.. seo::
    :description: Instructions for setting up Dallas 1-Wire PIO addressable switch as ESPHome binary sensor
    :image: dallas_pio.jpg
    :keywords: Dallas, ds2413, ds2406, ds2408, onewire

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__),
`DS2406`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2406.pdf>`__),
`DS2408`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2408.pdf>`__)
and similar 1-Wire Dallas addressable switches PIO as ESPHome binary sensors.  A :ref:`Dallas PIO <dallas_pio>` is
required to be set up in your configuration for this binary sensor to work.

### Example Configuration

Below are configuration examples for different Dallas devices, including DS2408 with P0-P7 pin usage.

#### Single DS2413 on One-Wire Bus

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: dallas_pio
        name: ds2413 binary sensor  # Friendly name for the binary sensor
        dallas_pio_id: ds2413_ic1   # Reference to the Dallas PIO component
        id: ds2413_binary_sensor    # Optional ID for internal reference
        pin:
          number: PIOA              # Pin to use on the Dallas device (PIOA/PIOB for DS2413/DS2406, P0-P7 for DS2408)
          mode:                     # Configuration of the pin's behavior
            input: true             # If set, must be true to read input values from the pin
          inverted: true            # Invert the signal (true = active-low, false = active-high)
        update_interval: 1s         # How often the sensor should poll the pin's state

#### Multiple Devices (DS2413 and DS2408) on the Same Bus

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:                
      - platform: dallas_pio      
        name: ds2413 binary sensor
        dallas_pio_id: ds2413_ic1 
        id: ds2413_binary_sensor  
        pin:                      
          number: PIOA            
          mode:                   
            input: true           
          inverted: true          
        update_interval: 1s       
               
      - platform: dallas_pio      
        name: ds2408 binary sensor
        dallas_pio_id: ds2408_ic2 
        id: ds2408_binary_sensor  
        pin:                      
          number: P0            
          mode:                   
            input: true           
          inverted: true          
        update_interval: 1s       


Configuration variables:
************************

- **name** (*Optional*, string): The name for the sensor. At least one of **id** and **name** must be specified.
- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **dallas_pio_id** (*Required*, string): The ID of the dallas pio to use.
- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The PIO pin to use for the binary sensor.
  Options:
  - **number**: The pin to use. For DS2413 or DS2406, use `PIOA` or `PIOB`. For DS2408, use `P0` to `P7`.
  - **mode**: 
    - `input: true`: Configure the pin as an input (default)
    - `input: false`: not allowed (binary sensor acts necessarily as an input).
  - **inverted**: Set to `true` to interpret a high signal as low (active-low). Useful for devices where a low voltage signifies an active state. Defaults to `false`.
- **update_interval** (*Optional*, :ref:`config-time`): The interval that the binary sensors should be checked. Defaults to 1 second.
- All other options from :ref:`Binary Sensor <config-binary_sensor>`.

See Also
--------

- :apiref:`dallas_pio/binary_sensor.h`
- :ghedit:`Edit`
