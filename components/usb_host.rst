USB Host Interface
==================


.. seo::
    :description: Instructions for setting up a USB Host interface on an ESP32 in ESPHome
    :image: usb.svg

The USB Host interface on the ESP32-S3 and ESP32-S2 is used to connect to USB peripheral devices. Multiple
devices may be configured, but only one can be connected at any time. The ESP32-S3 and ESP32-S2 do not support
USB hubs.

This component is used by the ``usb_uart`` component to allow the ESP32 to connect to USB-serial devices. It is also
possible to configure devices directly in this component, but this has no application other than for debug purposes.

.. code-block:: yaml

    # Example configuration entry
    usb_host:
      devices:
        - id: device_0
          vid: 0x1725
          pid: 0x1234


Configuration variables:
************************

- **id** (*Optional*, :ref:`config-id`): The id to use for this component.
- **devices** (*Optional*, list): A list of devices to configure.

Device configuration options:
*****************************

- **id** (*Optional*, :ref:`config-id`): An id to assign to the device.
- **vid** (**Required**, int): The vendor ID of the device. Use 0 as a wildcard.
- **pid** (**Required**, int): The product ID of the device. Use 0 as a wildcard.

Setting both ``vid`` and ``pid`` to 0 will match any device.

If a device is configured and a device is connected that matches the configuration, the device will be
connected to the ESP32 and log entries will appear at the DEBUG level. If the log level is set to VERBOSE,
then the configuration descriptors of the device will be dumped. The device will remain connected until
it is disconnected or the ESP32 is reset.

If a device is plugged in that does not match any configured device, the device will be disconnected and
a log entry will appear at the DEBUG level.


See Also
--------

- :doc:`/components/usb_uart`
- :apiref:`usb_host/usb_host.h`
- :ghedit:`Edit`
