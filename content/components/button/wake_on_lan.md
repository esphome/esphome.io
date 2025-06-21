Wake-on-LAN Button
====================

.. seo::
    :description: Instructions for setting up buttons that can send wakeup packets to computers on the network.
    :image: radio-tower.svg

The ``wake_on_lan`` button platform allows you to send a Wake-on-LAN magic packet to a computer on the network
by specifying its MAC address.

.. code-block:: yaml

    # Example configuration entry
    button:
      - platform: wake_on_lan
        name: "Start the Server"
        target_mac_address: XX:XX:XX:XX:XX:XX

Configuration variables:
------------------------

- **target_mac_address** (**Required**, MAC Address): The MAC Address of the target computer.
- All other options from :ref:`Button <config-button>`.

See Also
--------

- :doc:`template`
- :apiref:`wake_on_lan/wake_on_lan.h`
- :ghedit:`Edit`
