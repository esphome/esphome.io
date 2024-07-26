ESPNow communication Component
==============================

.. seo::
    :description: Instructions for setting up the basic ESPNow component in ESPHome.
    :image: esp-now-logo.png

.. note::

    To enables the option to interact with other esp32 devices over the Espressif's ESP-NOW protocol, see
    `there documentation <https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/network/esp_now.html>`__

This commponent allows ESPHome to communicate with esp32 devices in a simple and unsustricted way. You can receive using an event handler and
and transmit data package via the `espnow.send` action, by broatcasting to every device or a specific device in your network.

.. note::

    Broadcast data package is not recommend, this will also reach not owned device from other vendors or users that uses the esp-now protocol.
    The best solution is to minimalice the broadcasting as much as possible and use it only for identification purposes.


.. _config-espnow:

ESP-NOW Configuration
---------------------

.. code-block:: yaml

    # Example espnow configuration
    espnow:
      auto_add_peer: true
      channel: 1
      auto_add_peer: true
      peers:
        - FF:FF:FF:FF:FF:FF
      on_received:
        - logger.log:
            format: "Received: %s RSSI: %d"
            args: [ packet.payload_as_bytes(), packet.rssi]
      on_sent: 
        - logger.log:
            format: "Received: %s%s"
            args: [ packet.get_payload(), status?"":" [Failed]"]
      on_new_peer:
        - logger.log:
            format: "Peer %012llx is a new user. It will be added."
            args: [ packet.peer ]
        - espnow.add_peer: packet.peer



Configuration variables:

- **auto_add_peer** (*Optional*, boolean): This will allow the esp-now component to add a new incoming device to be added as peer.
- **channel** (*Optional*, int): The wifi channel that the esp-now communication will use to send/receive data package.
- **conformation_timeout** (*Optional*, int): Time between retries. 
- **auto_add_peer** (*Optional*, boolean): Enable adding new peers automatically.
- **peers** (*Optional*, list): A peer is the name for devices that uses esp-now. The list will have all MAC addresses from
  the devices where this device may communicate with.

Automations:

- **on_new_peer** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a data package is received from an unknown peer. See :ref:`espnow-on_new_peer`.

- **on_received** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a data package is received. See :ref:`espnow-on_received`.
- **on_broadcasted** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a data package is received as broadcast message. See :ref:`espnow-on_broadcasted`.

- **on_sent_succeed** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a message is confirmed to be send. See :ref:`espnow-on_sent`.
- **on_sent_failed** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a message was not sent properly. See :ref:`espnow-on_sent`.


.. _espnow-espnowpackage:

ESPNow Automation
-----------------

All automations below will have a "***packet***" variable that will have all information about the received data. 
It exist of the following data:

.. code-block:: c++

    class ESPNowPacket {
      public:
        uint8_t *payload()       // pointer to the payload section of the content that was received
        size_t size();           // size of the payload section.
        
        uint8_t *peer_address(); // 6 byte pointer to the mac address of the sending device
        uint64_t peer_id();      // 64bit version of the peer address 
        std::string peer_str();  // this will show the peer address as readable string as *aa:bb:cc:dd:ee:ff*
        
        std::string info();      // show all that collected in the packet. 
        
        uint32_t timestamp();    // shows the time when the packet was received
        
        uint8_t rssi();          // shows the stranged of the packet that was received
        
        bool is_broadcasted();   // is this received as broadcast message
    }


.. _espnow-on_received:

``on_received``
**************

This automation will be triggered when a data package is received. You can get the package data via the "packet" variable. see :ref:`espnow-espnowpackage`.

.. code-block:: yaml

    espnow:
      on_receive:
        - logger.log:
            format: "Received: %s RSSI: %d"
            args: [ packet.payload(), packet.rssi() ]

Configuration variables: see :ref:`Automation <automation>`.


.. _espnow-on_sent:

``on_sent_succeed``
*******************

This automation will be triggered when a data package is Sent succesvol. You can get the package data via the "packet" variable. see :ref:`espnow-espnowpackage`.

.. code-block:: yaml

    espnow:
      on_sent_succeed:
        - logger.log:
            format: "Packet sent succesfull: %s "
            args: [ packet.info().c_str() ]


``on_sent_failed``
******************

This automation will be triggered when a data package failed to be is Sent. You can get the package data via the "packet" variable. see :ref:`espnow-espnowpackage`.


.. code-block:: yaml

    espnow:
      on_sent_failed:
        - logger.log:
            format: "Packet sent succesfull: %s "
            args: [ packet.info().c_str() ]


Configuration variables: see :ref:`Automation <automation>`.

.. _espnow-on_new_peer:

``on_new_peer``
***************

This automation will be triggered when a data package is received from an unknown device. This trigger will only be fired when ``auto_add_peer`` is **false**.
To the sending peer addres can be found the package data via the "packet" variable. see :ref:`espnow-espnowpackage`.
To allow the the new device to be handled correctly you need to add it as a *new peer* with the ``espnow.add.peer`` action.

.. code-block:: yaml

    espnow:
      on_new_peer:
        - logger.log:
            format: "Received packet from new peer: 0x012llx "
            args: [ packet.peer_id() ]
        - espnow.add.peer: !lambda return packet.peer_id();

Configuration variables: see :ref:`Automation <automation>`.


.. _espnow-send_action:

``espnow.send`` Action
***********************

This is an :ref:`Action <config-action>` for sending a data package over the espnow protocol.

.. code-block:: yaml

    globals:
      - id: custom_peer
        type: uint64_t
        restore_value: yes
        initial_value: '66:55:44:33:22:11'
    
    binary_sensor:
      - platform: gpio
        pin: D1
        on_click:
         - espnow.send:
             peer_address: 11:22:33:44:55:66
             payload: "The big angry wolf awakes"
         - espnow.send: 
             peer_address: !lambda: "return id(custom_peer);"
             payload: [0x00, 0x00, 0x34, 0x5d]
         - espnow.broadcast: 0x20DF10EF`
            

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The ID of the espnow component to set.
- **peer_address** (*Optional*, Peer Address): The MAC address of the receiving device to connect to. When omitted it will broadcast the package to every device.
- **payload** (**Required**, multiple): The data that need to be send as broadcast or specific device.

You can send data as string, as an array of bytes or as integer (Litle Ending). The maximal bytes that can be send is 240 bytes; 10 less then the offical protocol;
we will add an prefix and checksum code to the data.

.. _espnow-add_peer:

``espnow.add.peer`` Action
**************************

This is an :ref:`Action <config-action>` to add a new peer to the internal allowed peers list.

.. code-block:: yaml

    espnow:
      on_new_peer:
        - logger.log:
            format: "Send data: %s \n New Peer: 0x%12h "
            args: [ packet.payload(), packet.peer_id()]
        - espnow.add.peer: 
             peer_address: !lambda return packet.peer_id();
             make_default: true


Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The ID of the espnow component to set.
- **peer_address** (**Required**, Peer Address): The Peer address that needs to be added to the list of allowed peers.
- **make_default** (*Optional*, boolean): Makes this new peer the default peer address


.. _espnow-del_peer:

``espnow.del.peer`` Action
**************************

This is an :ref:`Action <config-action>` to remove a known peer from the internal allowed peers list.

.. code-block:: yaml

      on_...:
        - espnow.add.peer: packet.peer: 11:22:33:44:55:66

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The ID of the espnow component to set.
- **peer_address** (**Required**, Peer Address): The Peer address that needs to be added to the list of allowed peers.



See Also
--------

- :apiref:`espnow/espnow.h`
- :ghedit:`Edit`

.. toctree::
    :maxdepth: 1
    :glob:
