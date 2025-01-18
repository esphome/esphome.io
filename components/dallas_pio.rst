.. _dallas_pio:

Dallas PIO
==========

.. seo::
    :description: Instructions for setting up Dallas 1-Wire addressable switches
    :image: dallas_pio.jpg
    :keywords: Dallas, PIO, DS2413, DS2406, DS2408, onewire, 1-wire

.. warning::

    **Warning**: This component is currently implemented for the DS2406 and DS2408 but has not yet been fully tested.  
    - It may contain bugs or limitations.  
    - Ensure proper testing in your environment before deploying in production.  
    - Known issues: None reported yet.  

    **Feedback Needed**:  
    Please test this component with your hardware and report issues or share feedback on GitHub.

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__),
`DS2406`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2406.pdf>`__),
`DS2408`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2408.pdf>`__)
and similar 1-Wire addressable switches.  A :ref:`1-Wire bus <one_wire>` is
required to be set up in your configuration for this sensor to work.

Example Configuration
*********************

Below are configuration examples for different Dallas devices.

**Single DS2413 on One-Wire Bus**

.. code-block:: yaml

    # Example configuration entry
    dallas_pio:
      - id: ds2413_ic1
        name: DS2413 IC1
        reference: DS2413
        address: 0xfe10055073e122ba
        one_wire_id: OneWireBus1

**Multiple Devices (DS2413 and DS2408) on the Same Bus**

.. code-block:: yaml

    # Example configuration entry
    dallas_pio:
      - id: ds2413_ic1
        name: DS2413 IC1
        reference: DS2413
        address: 0xfe10055073e122ba
        one_wire_id: OneWireBus1
        
      - id: ds2408_ic2
        name: DS2408 IC2
        reference: DS2408
        address: 0x1234567812345628
        one_wire_id: OneWireBus1

#### Address Format

The `address` parameter specifies the unique 1-Wire address of the device. This address is an 8-byte hexadecimal value (e.g., `0xfe10055073e122ba`) and can typically be obtained using a 1-Wire bus scanner or through the Dallas 1-Wire library.


Configuration variables:
************************
- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **name** (*Optional*, string): The name for the sensor. At least one of **id** and **name** must be specified.
- **reference** (*Optional*, string): The dallas reference of adressable switch among DS2413 (default), DS2406 or DS2408 (see warning note below).
- **address** (*Required*, int): The address of the sensor. Required if there is more than one device on the bus.
- **crc** (*Optional*, bool): [DS2406 only] Use CRC if true. Defaults to false.
- **one_wire_id** (*Required*, :ref:`config-id`): Manually specify the ID used for code generation.  Required if you have multiple busses.


See Also
--------

- :doc:`/components/binary_sensor/index`
- :doc:`/components/switch/index`
- :doc:`/components/one_wire`
- :apiref:`dallas_pio/dallas_pio.h`
- :ghedit:`Edit`
