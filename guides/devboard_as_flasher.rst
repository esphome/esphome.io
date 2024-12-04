Using an ESP devboard as a USB-UART bridge
==========================================

.. _devboard-as-flasher:

ESP development boards usually have an onboard USB interface, either built into the chip (e.g. ESP32-S3) or via an onboard USB-UART bridge chip.
However some ESP based devices not designed for development work don't bother with this,
and only expose the UART0 pins (TX and RX) for flashing purposes.

Normally you would use a dedicated USB-UART interface board for this but what if you don't have one?
In this "emergency" situation it is possible to use a development board that does have a USB-UART bridge chip to flash another device.
This is achieved by holding the ESP chip in reset so that it doesn't interfere with the bridge chip operation.

It does NOT require any firmware to be flashed onto the development board
and will not change anything already flashed onto it - it's purely a way to use the serial interface chip.

We will refer to the devboard with functional USB_UART bridge chip as flasher board for this guide.

Make sure you've read the :doc:`/guides/physical_device_connection` for properly understanding the functionality of your flasher devboard.

.. figure:: /guides/images/devboard-as-flasher.png
    :align: center
    :width: 75.0%

    Connection diagram for an ESP flash target

You need to make the following electrical connections:

.. note::

    - Most ESP32 S and C series boards do *not* have a separate USB-UART chip - they have it built into the ESP - so are not suitable for this application.
    - The 5V connection on either board may be labelled either ``5V`` or ``VIN``. Some boards may not have a 5V connection and will require 3.3V only.
    - Rather than powering the target board from the flasher board, it is also possible to use a separate power supply, just make sure all the ground pins are connected together.

- connect both ``EN`` and ``GND`` together in the flasher devboard
- ``+5.0V`` or ``3V3`` on the flasher devboard to ``VIN`` or ``3V3`` respectively of the target device
- ``GND``, or ground of flasher devboard to ``GND`` of the target device
- ``TX`` of flasher devboard to ``TX`` of the target device
- ``RX`` of flasher devboard to ``RX`` of the target device

Pulling down ``EN`` by connecting it to ``GND`` on the flasher board prevents
the ESP chip on flasher module from booting and polluting the serial lines.

.. note::

    - If the board has not previously had ESPHome loaded, you may need to pull the ``IO0`` pin low (i.e. connected to ``GND``) to force the board into flash mode.
      This must be done before power is applied.
    - Do not connect 3V3 to VIN of the target devices with a 3V3 LDO as it may lead to brownouts.

Once the connections are made, plug the flasher board into your computer via USB and proceed with flashing the target board via whichever means you intend to use.
