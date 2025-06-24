
Hamulight RF
============

.. seo::
    :description: Instructions for setting up the Hamulight RF component in ESPHome to control Hamulight's LED driver.
    :image: remote.svg
    :keywords: 433, RF, tx, hamulight, remote, LED

The ``hamulight`` component lets you send 433 MHz RF signals to control LED drivers manufactured by Hamulight B.V.

.. note::

    This project is in no way associated, supported or otherwise linked to Hamulight B.V. or any of its affiliates!
    This component utilizes ESP32's RMT peripheral for high timing accuracy.
    **Therefore it will only work with ESP32 microcontrollers and its variants**
    ESPHome Hamulight does **not** use HomeAssistant's light entities. Reason for that is that this project is following a
    stateless approach (as you never know, if a RF signal has been received and executed by the LED driver). This makes the
    YAML configuration part a little bit more complex, but also more flexible at the same time.

``hamulight`` synthesizes and replays the proprietary Hamulight RF protocol using the ESP32's RMT peripheral for
precise waveform generation.

.. code-block:: yaml

    # Example configuration entry

    hamulight:
      id: hamulight_transmitter
      rf_transmit_pin: GPIO2
      # led_pin: GPIO21     # <- optional: GPIO for feedback LED
      rf_address: 0xC535    # <- your remote's unique ID, which the LED driver is / should be paired with

      # Command scanner configuration (optional)
      # To use, uncomment and define the matching number/sensor blocks below:
      # command_scanner:
      #   enabled: true
      #   cmdscan_start: hamulight_cmdscan_start
      #   cmdscan_end: hamulight_cmdscan_end
      #   cmdscan_pause: hamulight_cmdscan_pause
      #   last_scanned_sensor: hamulight_last_scanned_command

    # IMPORTANT: The sensor component is required, even if the command scanner is not used
    #            You can use e.g. the uptime-sensor as in the example below (or none at all)
    sensor:
      - platform: uptime
        name: "Uptime"
    # - platform: template
    #   id: hamulight_last_scanned_command
    #   name: "Hamulight Last Scanned Command"

    number:
      - platform: template
        id: hamulight_brightness
        name: "Hamulight Brightness"
        min_value: 0
        max_value: 100
        step: 1
        optimistic: true
        initial_value: 100
        on_value:
          - lambda: |-
              id(hamulight_transmitter).set_brightness(x);

    # OPTIONAL - Following number sensors are needed for the command scanner
    # - platform: template
    #   id: hamulight_cmdscan_start
    #   name: "Command Scan Start"
    #   min_value: 0
    #   max_value: 127
    #   step: 1
    #   optimistic: true
    #   initial_value: 0
    # - platform: template
    #   id: hamulight_cmdscan_end
    #   name: "Command Scan End"
    #   min_value: 0
    #   max_value: 127
    #   step: 1
    #   optimistic: true
    #   initial_value: 127
    # - platform: template
    #   id: hamulight_cmdscan_pause
    #   name: "Command Scan Pause"
    #   min_value: 0
    #   max_value: 7000
    #   step: 100
    #   optimistic: true
    #   initial_value: 500

   button:
     - platform: template
       name: "Toggle Hamulight"
       on_press:
         - lambda: |-
             id(hamulight_transmitter).toggle();
     - platform: template
       name: "Pair with Driver"
       on_press:
         - lambda: |-
             id(hamulight_transmitter).pair_with_driver();

   # OPTIONAL - Following button sensors are needed for the command scanner
   # - platform: template
   #   name: "Start Command Scan"
   #   on_press:
   #     - lambda: |-
   #         id(hamulight_transmitter).start_command_scan();
   # - platform: template
   #   name: "Stop Command Scan"
   #   on_press:
   #     - lambda: |-
   #         id(hamulight_transmitter).stop_command_scan();

Configuration variables:
------------------------
- **id** (**Required**): needed for connecting HomeAssistant entities (buttons and sensors) used by the component
- **rf_transmit_pin** (**Required**, :ref:`config-pin`): The pin to transmit the remote signal on.
- **led_pin** (*Optional*, :ref:`config-pin`): GPIO for feedback LED
- **rf_address** (**Required**): The remote's unique ID the LED driver is/should be trained on
- **command_scanner** (*Optional*): Used to send different comments to identify unknown commands.
  Only needed for development! Details: See YAML example configuration.

**command_scanner variables:**

+-------------------------+---------+----------+----------------------------------------------+
| Option                  | Type    | Required | Description                                  |
+=========================+=========+==========+==============================================+
| ``enabled``             | bool    | No       | Enable command scanner                       |
+-------------------------+---------+----------+----------------------------------------------+
| ``cmdscan_start``       | int     | No       | ID of start value number entity              |
+-------------------------+---------+----------+----------------------------------------------+
| ``cmdscan_end``         | int     | No       | ID of end value number entity                |
+-------------------------+---------+----------+----------------------------------------------+
| ``cmdscan_pause``       | int     | No       | ID of pause duration number entity           |
+-------------------------+---------+----------+----------------------------------------------+
| ``last_scanned_sensor`` | int     | No       | ID of sensor to publish last scanned cmd     |
+-------------------------+---------+----------+----------------------------------------------+

.. note::

    The ESPHome Hamulight componenent is written as dynamical as possible to allow other devs to use it for other protocol
    implementations as well.

Protocol Summary
^^^^^^^^^^^^^^^^

The Hamulight RF protocol is a proprietary 433 MHz protocol used by Hamulight lighting products. This project reverse-engineers and replicates the protocol with high timing accuracy.

- **Frequency:** 433 MHz (OOK/ASK modulation)
- **Main control:** 32-bit address, 8-bit command, 8-bit checksum (total 4 bytes)
- **Each command is repeated multiple times for reliability**

RF Command Structure
^^^^^^^^^^^^^^^^^^^^

Each RF message (per transmission) consists of:

+-----------------+-------------+----------------------------------------------+
| Field           | Size (bits) | Description                                  |
+=================+=============+==============================================+
| Address High    | 8           | High byte of RF address                      |
+-----------------+-------------+----------------------------------------------+
| Address Low     | 8           | Low byte of RF address                       |
+-----------------+-------------+----------------------------------------------+
| Command         | 8           | Command byte (e.g., 0x5F=Toggle, 0x59=Pair)  |
+-----------------+-------------+----------------------------------------------+
| Checksum        | 8           | addr_hi + addr_lo + cmd - 83                 |
+-----------------+-------------+----------------------------------------------+

**Transmission sequence:**

1. **Start Sequence:** 10 pulses (8x[1,1]+2x[6,6])
2. **Data:** 32 bits (address, command, checksum), encoded as pairs of pulses:
   - **"0" bit:** [3,1] (high, low)
   - **"1" bit:** [1,3] (high, low)
3. **Repeat:** Full sequence transmitted 6 times per command

Timing and Transmission
^^^^^^^^^^^^^^^^^^^^^^^

- **Base pulse:** 200 microseconds (us)
- **Start sequence:** 8 x [1,1] (200us high, 200us low), then 2 x [6,6] (1200us high, 1200us low)
- **Data bits:** Each bit is a [high, low] pair, either [3,1] (0) or [1,3] (1) in multiples of base pulse
- **Total bits:** 32 (address, command, checksum)

**Example:**  
Toggle command: Address = 0xC535, Command = 0x5F (Toggle), Checksum = 0x35+0xC5+0x5F-83

Hardware Requirements
---------------------

- **ESP32, ESP32-S2, ESP32-S3, ESP32-C3**, or comparable microcontroller
- **433MHz RF transmitter module** (connect to any suitable ESP32 GPIO)
- (Optional) **Status LED** for RF activity indication
- **Hamulight RF-based lighting driver(s)**

Commands / Constants
--------------------

**Address / Header**  
First 2 bytes of the protocol is the remote's ID. The assumption (based on the analysis of 2 different remotes) is that you can choose ANY address here, since the driver/receiver can be trained for any Hamulight remote with that protocol.

**Remote Control's Commands**

5 buttons of the remote are hard-coded, a capacitive touch field is used for seamless dimming

+-------------------+----------+--------------------------------------------------------------+
| Command           | Byte     | Description                                                  |
+===================+==========+==============================================================+
| RFaddress         | var      | Change the address in the YAML config as needed to match     |
|                   |          | your physical remote                                         |
+-------------------+----------+--------------------------------------------------------------+
| RFpower           | 0x5F     | On/off toggle                                                |
+-------------------+----------+--------------------------------------------------------------+
| RFbright100       | 0x59     | 100% brightness command + command for training the receiver  |
+-------------------+----------+--------------------------------------------------------------+
| RFbright75        | 0x50     | 75% brightness command                                       |
+-------------------+----------+--------------------------------------------------------------+
| RFbright50        | 0x56     | 50% brightness command                                       |
+-------------------+----------+--------------------------------------------------------------+
| RFbright25        | 0x55     | 25% brightness command                                       |
+-------------------+----------+--------------------------------------------------------------+
| RFslideRangeMin   | 0x80     | Lowest HEX value used by dimm slider                         |
+-------------------+----------+--------------------------------------------------------------+
| RFslideRangeMax   | 0xFF     | Highest HEX value used by dimm slider                        |
+-------------------+----------+--------------------------------------------------------------+
| RFslideOffset     | 0xA8     | Needed for the offset in the slideValConv() function         |
+-------------------+----------+--------------------------------------------------------------+
| RFslideSteps      | calc     | Steps from 0% to 100% dimm value                             |
|                   |          | (RFslideRangeMax - RFslideRangeMin + 1)                      |
+-------------------+----------+--------------------------------------------------------------+
| RFslideStart      | calc     | Is the 0% dimm value position                                |
|                   |          | (RFslideRangeMin + RFslideOffset)                            |
+-------------------+----------+--------------------------------------------------------------+

Buttons
^^^^^^^

+-----------------------+------------------------------------------------------------+-----------------------------+
| Name                  | Description                                                | Calls C++ Method            |
+=======================+============================================================+=============================+
| Toggle Hamulight      | Toggle the connected Hamulight device on/off               | ``toggle()``                |
+-----------------------+------------------------------------------------------------+-----------------------------+
| Pair with Driver      | Pair remote/ESP32 with Hamulight driver (max brightness)   | ``pair_with_driver()``      |
+-----------------------+------------------------------------------------------------+-----------------------------+
| Start Command Scan    | Start scanning a range of commands                         | ``start_command_scan()``    |
+-----------------------+------------------------------------------------------------+-----------------------------+
| Stop Command Scan     | Stop command scanning                                      | ``stop_command_scan()``     |
+-----------------------+------------------------------------------------------------+-----------------------------+

Numbers
^^^^^^^

+-----------------------+----------------------------------------+----------------------+
| Name                  | Description                            | Used for Command Scan|
+=======================+========================================+======================+
| Command Scan Start    | First command in scan range            | Yes                  |
+-----------------------+----------------------------------------+----------------------+
| Command Scan End      | Last command in scan range             | Yes                  |
+-----------------------+----------------------------------------+----------------------+
| Command Scan Pause    | Delay (ms) between commands            | Yes                  |
+-----------------------+----------------------------------------+----------------------+
| Hamulight Brightness  | Set brightness (0-100%)                | No (direct control)  |
+-----------------------+----------------------------------------+----------------------+

Sensors
^^^^^^^

+------------------------------+------------------------------------------------+
| Name                         | Description                                    |
+==============================+================================================+
| Hamulight Last Scanned Command| Publishes last command sent during scan       |
+------------------------------+------------------------------------------------+

Acknowledgements
----------------

- `Hamulight <https://www.hamulight.nl/>`_ for their products and inspiration
- ESPHome community for the custom component framework

Pairing process
---------------

Disconnect and reconnect the LED driver from mains and send the "max brightness" command within the first 10 seconds.



See Also
--------

- :ghedit:`Edit`
