Using an ESP devboard as serial flasher
=======================================

If you have a functioning ESP devboard onto which you can flash firmware via USB port,
it can be also used to flash/communicate via serial to other devices as well.
We will refer to the devboard with functional USB_UART bridge chip as flasher board in this guide.

Make sure you've read the :doc:`/guides/physical_device_connection` for properly understanding the functionality of your flasher devboard.

.. figure:: /guides/images/devboard-as-flasher.png
    :align: center
    :width: 75.0%

    Connection diagram for an ESP flash target

You need to make five electrical connections:
- connect both ``EN`` and ``GND`` together in the flasher devboard
- ``+5.0V`` or ``3V3`` on the flasher devboard to ``VIN`` or ``3V3`` respectively of the ``target device``
- ``GND``, or ground
- ``TX`` of flasher devboard to ``TX`` of the ``target device``
- ``RX`` of flasher devboard to ``RX`` of the ``target device``

Note::
- On some boards like the AiThinker Cam models, you additionally need to connect IO0 with GND on the target device
  to manually put the target board in flash/download mode.
- Do not connect 3V3 to VIN of the target devices with a 3V3 LDO as it may lead to brownouts.

Pulling down ``EN`` by connecting it to ``GND`` on the flasher board prevents
the ESP chip on flasher module from booting and polluting the serial lines.

Because it is really exposing the onboard USB_UART bridge chip,
it can even be used to interface with serial console (using PuTTy or similar) on a RPi or any similar device.
You may need to enable serial interface from raspi-config first.
We don't decide what you may use it for.

The connection diagram is mostly unchanged.
- connect both ``EN`` and ``GND`` together in the flasher devboard
- connect ``GND`` to ``GND`` to prevent it from floating
- ``TX`` of flasher devboard to ``TX GPIO14`` of the ``RPi``
- ``RX`` of flasher devboard to ``RX GPIO15`` of the ``RPi``

.. figure:: /guides/images/devboard-as-flasher-pi.jpg
    :align: center
    :width: 75.0%

    Connection diagram for a RPi serial target. Refer to https://pinout.xyz/

Warning: Powering a Raspberry Pi directly through the flasher devboard is not advised.

Future Todo: verifying functionality for RPico and RPi5 debug ports.
