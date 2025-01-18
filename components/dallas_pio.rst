.. _dallas_pio:

Dallas PIO
==========

.. seo::
    :description: Instructions for setting up Dallas 1-Wire addressable switches
    :image: dallas_pio.jpg
    :keywords: Dallas, PIO, DS2413, DS2406, DS2408, onewire, 1-wire

The ``dallas_pio`` component allows you to use 
`DS2413 <https://www.adafruit.com/product/1551>`__
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2413.pdf>`__),
`DS2406`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2406.pdf>`__),
`DS2408`
(`datasheet <https://datasheets.maximintegrated.com/en/ds/DS2408.pdf>`__)
and similar 1-Wire addressable switches.  A :ref:`1-Wire bus <one_wire>` is
required to be set up in your configuration for this sensor to work.

.. code-block:: yaml

    # Example configuration entry
    dallas_pio:
      - id: ds2413_ic1
        name: DS2413 IC1
        reference: DS2413
        address: 0x1234567812345628
        one_wire_id: OneWireBus1


Configuration variables:
************************
- **id** (*Optional*, string): Manually specify the ID for code generation. At least one of **id** and **name** must be specified.
- **name** (*Optional*, string): The name for the sensor. At least one of **id** and **name** must be specified.
- **reference** (*Optional*, string): The dallas reference of adressable switch among DS2413 (default), DS2406 or DS2408 (see warning note below).
- **address** (*Required*, int): The address of the sensor. Required if there is more than one device on the bus.
- **crc** (*Optional*, bool): [DS2406 only] Use CRC if true. Defaults to false.
- **one_wire_id** (*Required*, :ref:`config-id`): Manually specify the ID used for code generation.  Required if you have multiple busses.

.. warning::

    The component is currently coded for the DS2406 and DS2408 but not tested.

See Also
--------

- :doc:`/components/binary_sensor/index`
- :doc:`/components/switch/index`
- :doc:`/components/one_wire`
- :apiref:`dallas_pio/dallas_pio.h`
- :ghedit:`Edit`
