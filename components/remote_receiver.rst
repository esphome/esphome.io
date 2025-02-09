Remote Receiver
===============

.. seo::
    :description: Instructions for setting up remote receiver binary sensors for infrared and RF codes.
    :image: remote.svg
    :keywords: RF, infrared

The ``remote_receiver`` component lets you receive and decode any remote signal, these can
for example be infrared remotes or 433MHz signals.

The component is split up into two parts: the remote receiver hub which
handles setting the pin and some other settings, and individual
:ref:`remote receiver binary sensors <remote-receiver-binary-sensor>`
which will trigger when they hear their own configured signal.

**See** :ref:`remote-setting-up-infrared` **and** :ref:`remote-setting-up-rf` **for set up guides.**

.. code-block:: yaml

    # Example configuration entry
    remote_receiver:
      pin: GPIOXX
      dump: all

Multiple remote receivers can be configured as a list of dict definitions in remote_receiver.

Configuration variables:
------------------------

- **pin** (**Required**, :ref:`config-pin`): The pin to receive the remote signal on.
- **dump** (*Optional*, list): Decode and dump these remote codes in the logs (at log.level=DEBUG).
  Set to ``all`` to dump all available codecs:

  - **abbwelcome**: Decode and dump ABB-Welcome codes. Messages are sent via copper wires. See :ref:`transmitter description <remote_transmitter-transmit_abbwelcome>` for more details.
  - **aeha**: Decode and dump AEHA infrared codes.
  - **byronsx**: Decode and dump Byron SX doorbell RF codes.
  - **canalsat**: Decode and dump CanalSat infrared codes.
  - **canalsatld**: Decode and dump CanalSatLD infrared codes.
  - **coolix**: Decode and dump Coolix infrared codes.
  - **dish**: Decode and dump Dish infrared codes.
  - **dooya**: Decode and dump Dooya RF codes.
  - **drayton**: Decode and dump Drayton Digistat RF codes.
  - **jvc**: Decode and dump JVC infrared codes.
  - **keeloq**: Decode and dump KeeLoq RF codes.
  - **haier**: Decode and dump Haier infrared codes.
  - **lg**: Decode and dump LG infrared codes.
  - **magiquest**: Decode and dump MagiQuest wand infrared codes.
  - **midea**: Decode and dump Midea infrared codes.
  - **nec**: Decode and dump NEC infrared codes.
  - **nexa**: Decode and dump Nexa (RF) codes.
  - **panasonic**: Decode and dump Panasonic infrared codes.
  - **pioneer**: Decode and dump Pioneer infrared codes.
  - **pronto**: Print remote code in Pronto form. Useful for using arbitrary protocols.
  - **raw**: Print all remote codes in their raw form. Also useful for using arbitrary protocols.
  - **rc5**: Decode and dump RC5 IR codes.
  - **rc6**: Decode and dump RC6 IR codes.
  - **rc_switch**: Decode and dump RCSwitch RF codes.
  - **roomba**: Decode and dump Roomba infrared codes.
  - **samsung**: Decode and dump Samsung infrared codes.
  - **samsung36**: Decode and dump Samsung36 infrared codes.
  - **sony**: Decode and dump Sony infrared codes.
  - **toshiba_ac**: Decode and dump Toshiba AC infrared codes.
  - **mirage**: Decode and dump Mirage infrared codes.

- **tolerance** (*Optional*, int, :ref:`config-time` or mapping): The percentage or time that the remote signal lengths can
  deviate in the decoding process.  Defaults to ``25%``.

  - **type** (**Required**, enum): Set the type of the tolerance. Can be ``percentage`` or ``time``.
  - **value** (**Required**, int or :ref:`config-time`): The percentage or time value. Allowed values are in range ``0`` to
    ``100%`` or ``0`` to ``4294967295us``.

- **buffer_size** (*Optional*, int): The size of the internal buffer for storing the remote codes. Defaults to ``10kB``
  on the ESP32 and ``1kB`` on the ESP8266.
- **rmt_channel** (*Optional*, int): The RMT channel to use. Only on **esp32**.
  The following ESP32 variants have these channels available:

  .. csv-table::
      :header: "ESP32 Variant", "Channels"

      "ESP32", "0, 1, 2, 3, 4, 5, 6, 7"
      "ESP32-S2", "0, 1, 2, 3"
      "ESP32-S3", "4, 5, 6, 7"
      "ESP32-C3", "2, 3"

- **memory_blocks** (*Optional*, int): The number of RMT memory blocks used. Only used on ESP32 platform. The maximum
  number of blocks shared by all receivers and transmitters depends on the ESP32 variant. Defaults to ``3``.
- **filter** (*Optional*, :ref:`config-time`): Filter any pulses that are shorter than this. Useful for removing
  glitches from noisy signals. Allowed values are in range ``0`` to ``4294967295us``. Defaults to ``50us``.
- **idle** (*Optional*, :ref:`config-time`): The amount of time that a signal should remain stable (i.e. not
  change) for it to be considered complete. Allowed values are in range ``0`` to ``4294967295us``. Defaults to ``10ms``.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation. Use this if you have
  multiple remote receivers.
- **clock_divider** (*Optional*, int): The clock divider used by the RMT peripheral. A clock divider of ``80`` leads to
  a resolution of 1 µs per tick, ``160`` leads to 2 µs. Allowed values are in range ``1`` to ``255``. Only used on ESP32
  platform. Defaults to ``80``.

.. note::

    The dumped **raw** code is sequence of pulse widths (durations in microseconds), positive for on-pulses (mark)
    and negative for off-pulses (space). Usually you can to copy this directly to the configuration or automation to be used later.


Automations:
------------

- **on_abbwelcome** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  ABB-Welcome code has been decoded. A variable ``x`` of type :apiclass:`remote_base::ABBWelcomeData`
  is passed to the automation for use in lambdas.
- **on_aeha** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  AEHA remote code has been decoded. A variable ``x`` of type :apiclass:`remote_base::AEHAData`
  is passed to the automation for use in lambdas.
- **on_byronsx** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Byron SX doorbell RF code has been decoded. A variable ``x`` of type :apistruct:`remote_base::ByronSXData`
  is passed to the automation for use in lambdas.
- **on_canalsat** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  CanalSat remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::CanalSatData`
  is passed to the automation for use in lambdas.
- **on_canalsatld** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  CanalSatLD remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::CanalSatLDData`
  is passed to the automation for use in lambdas.
- **on_coolix** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Coolix remote code has been decoded. A variable ``x`` of type :apiclass:`remote_base::CoolixData`
  is passed to the automation for use in lambdas.
- **on_dish** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  dish network remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::DishData`
  is passed to the automation for use in lambdas.
  Beware that Dish remotes use a different carrier frequency (57.6kHz) that many receiver hardware don't decode.
- **on_dooya** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Dooya RF remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::DooyaData`
  is passed to the automation for use in lambdas.
- **on_drayton** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Drayton Digistat RF code has been decoded. A variable ``x`` of type :apistruct:`remote_base::DraytonData`
  is passed to the automation for use in lambdas.
- **on_jvc** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  JVC remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::JVCData`
  is passed to the automation for use in lambdas.
- **on_keeloq** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  KeeLoq RF code has been decoded. A variable ``x`` of type :apistruct:`remote_base::KeeloqData`
  is passed to the automation for use in lambdas.
- **on_haier** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Haier remote code has been decoded. A variable ``x`` of type :apiclass:`remote_base::HaierData`
  is passed to the automation for use in lambdas.
- **on_lg** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  LG remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::LGData`
  is passed to the automation for use in lambdas.
- **on_magiquest** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  MagiQuest wand remote code has been decoded. A variable ``x`` of type :apiclass:`remote_base::MagiQuestData`
  is passed to the automation for use in lambdas.
- **on_midea** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Midea remote code has been decoded. A variable ``x`` of type :apiclass:`remote_base::MideaData`
  is passed to the automation for use in lambdas.
- **on_nec** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  NEC remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::NECData`
  is passed to the automation for use in lambdas.
- **on_nexa** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Nexa RF code has been decoded. A variable ``x`` of type :apiclass:`remote_base::NexaData`
  is passed to the automation for use in lambdas.
- **on_panasonic** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Panasonic remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::PanasonicData`
  is passed to the automation for use in lambdas.
- **on_pioneer** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  pioneer remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::PioneerData`
  is passed to the automation for use in lambdas.
- **on_pronto** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Pronto remote code has been decoded. A variable ``x`` of type ``std::string``
  is passed to the automation for use in lambdas.
- **on_raw** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  raw remote code has been decoded. A variable ``x`` of type ``std::vector<int>``
  is passed to the automation for use in lambdas.
- **on_rc5** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  RC5 remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::RC5Data`
  is passed to the automation for use in lambdas.
- **on_rc6** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  RC6 remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::RC6Data`
  is passed to the automation for use in lambdas.
- **on_rc_switch** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  RCSwitch RF code has been decoded. A variable ``x`` of type :apistruct:`remote_base::RCSwitchData`
  is passed to the automation for use in lambdas.
- **on_roomba** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Roomba remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::RoombaData`
  is passed to the automation for use in lambdas.
- **on_samsung** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Samsung remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::SamsungData`
  is passed to the automation for use in lambdas.
- **on_samsung36** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Samsung36 remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::Samsung36Data`
  is passed to the automation for use in lambdas.
- **on_sony** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Sony remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::SonyData`
  is passed to the automation for use in lambdas.
- **on_toshiba_ac** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Toshiba AC remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::ToshibaAcData`
  is passed to the automation for use in lambdas.
- **on_mirage** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a
  Mirage remote code has been decoded. A variable ``x`` of type :apistruct:`remote_base::MirageData`
  is passed to the automation for use in lambdas.

.. code-block:: yaml

    # Example automation for decoded signals
    remote_receiver:
      ...
      on_samsung:
        then:
        - if:
            condition:
              or:
                - lambda: 'return (x.data == 0xE0E0E01F);'  # VOL+ newer type
                - lambda: 'return (x.data == 0xE0E0E01F0);' # VOL+ older type
            then:
              - ...

.. _remote-receiver-binary-sensor:

Binary Sensor
-------------

The ``remote_receiver`` binary sensor lets you track when a button on a remote control is pressed.

Each time the pre-defined signal is received, the binary sensor will briefly go ON and
then immediately OFF.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: remote_receiver
        name: "Panasonic Remote Input"
        panasonic:
          address: 0x4004
          command: 0x100BCBD

Configuration variables:
************************

- **receiver_id** (*Optional*, :ref:`config-id`): The remote receiver to receive the
  remote code with. Required if multiple receivers configured.
- All other options from :ref:`Binary Sensor <config-binary_sensor>`.

Remote code selection (exactly one of these has to be included):

- **abbwelcome**: Trigger on a decoded ABB-Welcome code with the given data, see the :ref:`transmitter description <remote_transmitter-transmit_abbwelcome>` for more info.

  - **source_address** (**Required**, int): The source address to trigger on.
  - **destination_address** (**Required**, int): The destination address to trigger on.
  - **three_byte_address** (**Optional**, boolean): The length of the source and destination address. ``false`` means two bytes
    and ``true`` means three bytes. Defaults to ``false``.
  - **retransmission** (**Optional**, boolean): ``true`` if the message was re-transmitted. Defaults to ``false``.
  - **message_type** (**Required**, int): The message type to trigger on.
  - **message_id** (**Optional**, int): The random message ID to trigger on, see dumper output for more info. Defaults to any ID.
  - **data** (**Optional**, 0-7 bytes list): The code to listen for. Usually you only need to copy this directly from the
    dumper output. Defaults to ``[]``

- **aeha**: Trigger on a decoded AEHA remote code with the given data.

  - **address** (**Required**, int): The address to trigger on, see dumper output for more info.
  - **data** (**Required**, 3-35 bytes list): The code to listen for, see :ref:`transmitter description <remote_transmitter-transmit_aeha>`
    for more info. Usually you only need to copy this directly from the dumper output.

- **byronsx**: Trigger on a decoded Byron SX Doorbell RF remote code with the given data.

  - **address** (**Required**, int): The 8-bit ID code to trigger on, see dumper output for more info.
  - **command** (**Optional**, int): The 4-bit command to listen for. If omitted, will match on any command.

- **canalsat**: Trigger on a decoded CanalSat remote code with the given data.

  - **device** (**Required**, int): The device to trigger on, see dumper output for more info.
  - **address** (*Optional*, int): The address (or subdevice) to trigger on, see dumper output for more info. Defaults to ``0``
  - **command** (**Required**, int): The command to listen for.

- **canalsatld**: Trigger on a decoded CanalSatLD remote code with the given data.

  - **device** (**Required**, int): The device to trigger on, see dumper output for more info.
  - **address** (*Optional*, int): The address (or subdevice) to trigger on, see dumper output for more info. Defaults to ``0``
  - **command** (**Required**, int): The command to listen for.

- **coolix**: Trigger on a decoded Coolix remote code with the given data. It is possible to directly specify a 24-bit code,
  it will be checked for a match to at least one of the two received packets. The main configuration scheme is below.

  - **first** (**Required**, uint32_t): The first 24-bit Coolix code to trigger on, see dumper output for more info.
  - **second** (*Optional*, uint32_t): The second 24-bit Coolix code to trigger on, see dumper output for more info.
    If not set, trigger on on only single non-strict packet, specified by the ``first`` parameter.

- **dish**: Trigger on a decoded Dish Network remote code with the given data.
  Beware that Dish remotes use a different carrier frequency (57.6kHz) that many receiver hardware don't decode.

  - **address** (*Optional*, int): The number of the receiver to target, between 1 and 16 inclusive. Defaults to ``1``.
  - **command** (**Required**, int): The Dish command to listen for, between 0 and 63 inclusive.

- **dooya**: Trigger on a decoded Dooya RF remote code with the given data.

  - **id** (**Required**, int): The 24-bit ID code to trigger on.
  - **channel** (**Required**, int): The 8-bit channel to listen for.
  - **button** (**Required**, int): The 4-bit button to listen for.
  - **check** (**Required**, int): The 4-bit check to listen for. Includes an indication that a button is being held down.

- **drayton**: Trigger on a decoded Drayton Digistat RF remote code with the given data.

  - **address** (**Required**, int): The 16-bit ID code to trigger on, see dumper output for more info.
  - **channel** (**Required**, int): The 7-bit switch/channel to listen for.
  - **command** (**Required**, int): The 5-bit command to listen for.

- **jvc**: Trigger on a decoded JVC remote code with the given data.

  - **data** (**Required**, int): The JVC code to trigger on, see dumper output for more info.

- **keeloq**: Trigger on a decoded KeeLoq RF remote code with the given data.

  - **address** (**Required**, int): The 32-bit ID code to trigger on, see dumper output for more info.
  - **command** (**Required**, int): The 8-bit switch/command to listen for. If omitted, will match on any command/button.

- **haier**: Trigger on a Haier remote code with the given code.

  - **code** (**Required**, 13-bytes list): The code to listen for, see :ref:`transmitter description <remote_transmitter-transmit_haier>`
    for more info. Usually you only need to copy this directly from the dumper output.

- **lg**: Trigger on a decoded LG remote code with the given data.

  - **data** (**Required**, int): The LG code to trigger on, see dumper output for more info.
  - **nbits** (*Optional*, int): The number of bits of the remote code. Defaults to ``28``.

- **magiquest**: Trigger on a decoded MagiQuest wand remote code with the given wand ID.

  - **wand_id** (**Required**, int): The MagiQuest wand ID to trigger on, see dumper output for more info.
  - **magnitude** (*Optional*, int): The magnitude of swishes and swirls of the wand.  If omitted, will match on any activation of the wand.

- **midea**: Trigger on a Midea remote code with the given code.

  - **code** (**Required**, 5-bytes list): The code to listen for, see :ref:`transmitter description <remote_transmitter-transmit_midea>`
    for more info. Usually you only need to copy first 5 bytes directly from the dumper output.

- **nec**: Trigger on a decoded NEC remote code with the given data.

  - **address** (**Required**, int): The address to trigger on, see dumper output for more info.
  - **command** (**Required**, int): The NEC command to listen for.

- **nexa**: Trigger on a decoded Nexa RF code with the given data.

  - **device** (**Required**, int): The Nexa device code to trigger on, see dumper output for more info.
  - **group** (**Required**, int): The Nexa group code to trigger on, see dumper output for more info.
  - **state** (**Required**, int): The Nexa state code to trigger on, see dumper output for more info.
  - **channel** (**Required**, int): The Nexa channel code to trigger on, see dumper output for more info.
  - **level** (**Required**, int): The Nexa level code to trigger on, see dumper output for more info.

- **panasonic**: Trigger on a decoded Panasonic remote code with the given data.

  - **address** (**Required**, int): The address to trigger on, see dumper output for more info.
  - **command** (**Required**, int): The command.

- **pioneer**: Trigger on a decoded Pioneer remote code with the given data.

  - **rc_code_1** (**Required**, int): The remote control code to trigger on, see dumper output for more details.

- **pronto**: Trigger on a Pronto remote code with the given code.

  - **data** (**Required**, string): The code to listen for, see :ref:`transmitter description <remote_transmitter-transmit_raw>`
    for more info. Usually you only need to copy this directly from the dumper output.
  - **delta** (**Optional**, integer): This parameter allows you to manually specify the allowed difference
    between what Pronto code is specified, and what IR signal has been sent by the remote control.

- **raw**: Trigger on a raw remote code with the given code.

  - **code** (**Required**, list): The code to listen for, see :ref:`transmitter description <remote_transmitter-transmit_raw>`
    for more info. Usually you only need to copy this directly from the dumper output.

- **rc5**: Trigger on a decoded RC5 remote code with the given data.

  - **address** (**Required**, int): The address to trigger on, see dumper output for more info.
  - **command** (**Required**, int): The RC5 command to listen for.

- **rc6**: Trigger on a decoded RC6 remote code with the given data.

  - **address** (**Required**, int): The address to trigger on, see dumper output for more info.
  - **command** (**Required**, int): The RC6 command to listen for.

- **rc_switch_raw**: Trigger on a decoded RC Switch raw remote code with the given data.

  - **code** (**Required**, string): The remote code to listen for, copy this from the dumper output. To ignore a bit
    in the received data, use ``x`` at that place in the **code**.
  - **protocol** (*Optional*): The RC Switch protocol to use, see :ref:`remote_transmitter-rc_switch-protocol` for more info.

- **rc_switch_type_a**: Trigger on a decoded RC Switch Type A remote code with the given data.

  - **group** (**Required**, string): The group, binary string.
  - **device** (**Required**, string): The device in the group, binary string.
  - **state** (**Required**, boolean): The on/off state to trigger on.
  - **protocol** (*Optional*): The RC Switch protocol to use, see :ref:`remote_transmitter-rc_switch-protocol` for more info.

- **rc_switch_type_b**: Trigger on a decoded RC Switch Type B remote code with the given data.

  - **address** (**Required**, int): The address, int from 1 to 4.
  - **channel** (**Required**, int): The channel, int from 1 to 4.
  - **state** (**Required**, boolean): The on/off state to trigger on.
  - **protocol** (*Optional*): The RC Switch protocol to use, see :ref:`remote_transmitter-rc_switch-protocol` for more info.

- **rc_switch_type_c**: Trigger on a decoded RC Switch Type C remote code with the given data.

  - **family** (**Required**, string): The family. Range is ``a`` to ``p``.
  - **group** (**Required**, int): The group. Range is 1 to 4.
  - **device** (**Required**, int): The device. Range is 1 to 4.
  - **state** (**Required**, boolean): The on/off state to trigger on.
  - **protocol** (*Optional*): The RC Switch protocol to use, see :ref:`remote_transmitter-rc_switch-protocol` for more info.

- **rc_switch_type_d**: Trigger on a decoded RC Switch Type D remote code with the given data.

  - **group** (**Required**, int): The group. Range is 1 to 4.
  - **device** (**Required**, int): The device. Range is 1 to 3.
  - **state** (**Required**, boolean): The on/off state to trigger on.
  - **protocol** (*Optional*): The RC Switch protocol to use, see :ref:`remote_transmitter-rc_switch-protocol` for more info.

- **roomba**: Trigger on a decoded Roomba remote code with the given data.

  - **data** (**Required**, int): The Roomba code to trigger on, see dumper output for more info.

- **samsung**: Trigger on a decoded Samsung remote code with the given data.

  - **data** (**Required**, int): The data to trigger on, see dumper output for more info.
  - **nbits** (*Optional*, int): The number of bits of the remote code. Defaults to ``32``.

- **samsung36**: Trigger on a decoded Samsung36 remote code with the given data.

  - **address** (**Required**, int): The address to trigger on, see dumper output for more info.
  - **command** (**Required**, int): The command.

- **sony**: Trigger on a decoded Sony remote code with the given data.

  - **data** (**Required**, int): The Sony code to trigger on, see dumper output for more info.
  - **nbits** (*Optional*, int): The number of bits of the remote code. Defaults to ``12``.

- **toshiba_ac**: Trigger on a decoded Toshiba AC remote code with the given data.

  - **rc_code_1** (**Required**, int): The remote control code to trigger on, see dumper output for more details.
  - **rc_code_2** (*Optional*, int): The second part of the remote control code to trigger on, see dumper output for more details.

- **mirage**: Trigger on a Mirage remote code with the given code.

  - **code** (**Required**, 14-bytes list): The code to listen for, see :ref:`transmitter description <remote_transmitter-transmit_mirage>`
    for more info. Usually you only need to copy this directly from the dumper output.

.. note::

    The **CanalSat** and **CanalSatLD** protocols use a higher carrier frequency (56khz) and are very similar.
    Depending on the hardware used they may interfere with each other when enabled simultaneously.


.. note::

    **NEC codes**: In version 2021.12, the order of transferring bits was corrected from MSB to LSB in accordance with the NEC standard.
    Therefore, if the configuration file has come from an earlier version of ESPhome, it is necessary to reverse the order of the address
    and command bits when moving to 2021.12 or above. For example, address: 0x84ED, command: 0x13EC becomes 0xB721 and 0x37C8 respectively.


.. note::

    To capture the codes more effectively with directly connected receiver like tsop38238 you can try to use ``INPUT_PULLUP``:

    .. code-block:: yaml

        remote_receiver:
          pin:
            number: GPIOXX
            inverted: true
            mode:
              input: true
              pullup: true
          dump: all


.. note::

    For the black Sonoff RF Bridge, you can bypass the EFM8BB1 microcontroller handling RF signals with
    `this hack <https://github.com/xoseperez/espurna/wiki/Hardware-Itead-Sonoff-RF-Bridge---Direct-Hack>`__
    created by the GitHub user wildwiz. Then use this configuration for the remote receiver/transmitter hubs:

    .. code-block:: yaml

        remote_receiver:
          pin: 4
          dump: all

        remote_transmitter:
          pin: 5
          carrier_duty_percent: 100%

    There's also a software `"hack" <https://github.com/mightymos/RF-Bridge-OB38S003>`__ that allows the radio chip to mirror all the voltages to the ESP to do the decoding,
    rendering the hardware hack uncessary. This software passthrough mode can be used for the OB38S003 (white) and EFM8BB1 (black) sonoff RF bridge. Then use this configuration for the remote receiver/transmitter hubs:

    .. code-block:: yaml

        remote_receiver:
          pin:
            # sonoff and wemos board
            number: GPIO3
            mode:
              input: true
              pullup: false
          tolerance: 60%
          filter: 4us
          idle: 4ms
       
        remote_transmitter:
          pin: 1
          carrier_duty_percent: 100%

See Also
--------

- :doc:`index`
- :doc:`/components/remote_transmitter`
- :ref:`remote-setting-up-infrared`
- :ref:`remote-setting-up-rf`
- :doc:`/components/rf_bridge`
- `RCSwitch <https://github.com/sui77/rc-switch>`__ by `Suat Özgür <https://github.com/sui77>`__
- :apiref:`remote/remote_receiver.h`
- :ghedit:`Edit`
