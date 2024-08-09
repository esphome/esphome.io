.. _seeedmultichannelrelay_switch:

Seeed Multi Channel Relay Switch Component
==========================================

.. seo::
    :description: Instructions for setting up seeedmultichannelrelay Switch.

The ``seeedmultichannelrelay`` switch platform supports the 8 channels of the relay unit. There are multi relays which are supported.
The relays can be used to switch up to AC-250V or DC-110V. For more information: 

Below are several links to supported relays
https://wiki.seeedstudio.com/Grove-4-Channel_SPDT_Relay/

https://wiki.seeedstudio.com/Grove-8-Channel_Solid_State_Relay/

.. figure:: images/Seeed-4-Channel-SPDT-Relay.png
    :align: center
    :width: 80.0%

.. figure:: images/Seeed-8-Channel-Solid-State-Relay.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    seeedmultichannelrelay:
        id: SeeedMultiChannelRelay_ID
        change_address_to: 0x11 # changes the address of the seeedmultichannelrelay only runs this once
        # ...

    switch:
      - platform: seeedmultichannelrelay
        id: relay_1
        name: relay1
        channel: 1
        seeedmultichannelrelay_id: SeeedMultiChannelRelay_ID

Configuration variables:
------------------------
**Control**

- **change_address_to** (*Optional*, hex-address): This should only be added to change the i2c address
  on the EPROM of the relay. Afterwards the address will be permanently changed.

- All other options from I2C devices.

**Switch**

- **channel** (*Required*, string): The channel number to switch, options are 1 to 8 (depending on the relay switch design).
- **seeedmultichannelrelay_id** (*Optional*, :ref:`config-id`): The ID of the Seed relay.
- **interlock** (*Optional*, list): A list of other switches in an interlock group. See
  :ref:`switch-gpio-interlocking`.
- **interlock_wait_time** (*Optional*, :ref:`config-time`): For interlocking mode, set how long
  to wait after other items in an interlock group have been disabled before re-activating.
  Useful for motors where immediately turning on in the other direction could cause problems.

- All other options from :ref:`Switch <config-switch>`.

This switch supports the same interlocking as the GPIO switch.

See Also
--------

- :doc:`index`
- :apiref:`seeedmultichannelrelay/switch/seeedmultichannelrelay_switch.h`
- :apiref:`gpio/switch/gpio_switch.h`
- :ghedit:`Edit`
