Generic I²C device component:
-----------------------------
.. _i2c_device:

General-purpose I²C device component that can be used to communicate with hardware not supported by a specific component. It allows selection of the I²C address. Reads and writes on the device can be performed with lambdas. For example:

.. code-block:: yaml

    i2c:
        sda: 4
        scl: 5
        scan: True

    i2c_device:
      id: i2cdev
      address: 0x2C

   on...:
     then:
       - lambda: !lambda |-
           id(i2cdev).write_byte(0x00, 0x12);
           if (auto b = id(i2cdev).read_byte(0x01)) {
             // TODO
           }


Configuration variables:
------------------------

- **address** (*Required*, int): I²C address of the device.

See Also
--------

- :doc:`/components/i2c`
- :apiref:`i2c_device/i2c_device.h`
- :ghedit:`Edit`
