ESPNow communication Component
==============================

.. seo::
    :description: Instructions for setting up the basic ESPNow component in ESPHome.
    :image: esp-now.svg

This component allows ESPHome to communicate with esp32 devices in a simple and unrestricted way.
It enables the option to interact with other esp32 devices over the Espressif's ESP-NOW protocol, see
`documentation <https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/network/esp_now.html>`__

.. note::

    Broadcasting data is not recommended, this will also reach devices not controlled by you that use the esp-now protocol.
    The best solution is to minimize the broadcasting as much as possible and use it only for identification purposes.

.. code-block:: yaml

    # Example configuration entry
    espnow:

Configuration variables:
------------------------

- **channel** (*Optional*, int): The Wi-Fi channel that the esp-now communication will use to send/receive data packets.
  Cannot be set when the :doc:`wifi` is used, as it will use the same channel as the wifi network.
- **auto_add_peer** (*Optional*, boolean): This will allow the esp-now component to automatically add any new incoming device as a peer.
  See :ref:`espnow-peers` below. Defaults to ``false``.
- **enable_on_boot** (*Optional*, boolean): Enable the esp-now component on boot. Defaults to ``true``.
- **peers** (*Optional*, list): A peer is the name for devices that use esp-now. The list will have all MAC addresses from
  the devices where this device may communicate with. See :ref:`espnow-peers` below.

Automations:

- **on_receive** (*Optional*, :ref:`Automation <automation>`): An automation to perform when data is received. See :ref:`espnow-on_receive`.
- **on_unknown_peer** (*Optional*, :ref:`Automation <automation>`): An automation to perform when data is received from an unknown peer.
  Cannot be used when ``auto_add_peer`` is set to ``true``. See :ref:`espnow-on_unknown_peer`.
- **on_broadcast** (*Optional*, :ref:`Automation <automation>`): An automation to perform when a broadcast packet is received.
  See :ref:`espnow-on_broadcast`.

Automations
-----------

There will be 3 variables available to automations. Their memory will be cleaned up after the automation is
done and will not be available if there are any `delay` actions or others that do work "asynchronously" in the automation.

- **info**: :apistruct:`espnow::ESPNowRecvInfo` with information about the received packet.
- **data**: A `const uint8_t *` - pointer to the data.
- **size**: The size of the data in bytes.

.. code-block:: yaml

    espnow:
      on_...:
        - logger.log:
            format: "Sent to %s from %s: %s RSSI: %ddBm"
            args:
              - format_mac_address_pretty(info.des_addr).c_str()
              - format_mac_address_pretty(info.src_addr).c_str()
              - format_hex_pretty(data, size).c_str()
              - info.rx_ctrl->rssi

.. _espnow-on_receive:

``on_receive``
**************

This automation will be triggered when data is received from a registered peer.

Configuration variables:

- **address** (*Optional*, MAC Address): Filter this trigger to packets where the source address matches. If not set, it will match any device.

.. _espnow-on_unknown_peer:

``on_unknown_peer``
*******************

This automation will be triggered when data is received from a peer that is not in the list of known peers.

.. _espnow-on_broadcast:

``on_broadcast``
****************

This automation will be triggered when a broadcast packet is received.

Configuration variables:

- **address** (*Optional*, MAC Address): Filter this trigger to packets where the source address matches. If not set, it will match any device.


.. _espnow-send-action:

``espnow.send`` Action
***********************

This is an :ref:`Action <config-action>` for sending a data packet over the espnow protocol.

.. code-block:: yaml

    on_...:
      - espnow.send:
          address: 11:22:33:44:55:66
          data: "The big angry wolf awakens"
      - espnow.send:
          address: 11:22:33:44:55:66
          data: !lambda "return {0x00, 0x00, 0x34, 0x5d};"
      - espnow.send:
          address: !lambda "return {0x11, 0x22, 0x33, 0x44, 0x55, 0x66};"
          data: [0x00, 0x00, 0x34, 0x5d]
      - espnow.send:
          address: !lambda "return {0x11, 0x22, 0x33, 0x44, 0x55, 0x66};"
          data: !lambda "return {0x00, 0x00, 0x34, 0x5d};"


Configuration variables:

- **address** (**Required**, :ref:`templatable <config-templatable>`, MAC Address): The MAC address of the receiving device to send to.
- **data** (**Required**, :ref:`templatable <config-templatable>`, string or list of bytes): The data to be sent.
- **on_sent** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the data is sent successfully.
- **wait_for_sent** (*Optional*, boolean): The automation will wait for the data to be sent and for the ``on_sent`` or ``on_error``
  actions to be finished before continuing with the next action.
  Defaults to ``true``.
- **on_error** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the data could not be sent.
- **continue_on_error** (*Optional*, boolean): If set to ``false``, the next action will not be triggered if the data could not be sent.
  Defaults to ``true``.


.. _espnow-broadcast-action:

``espnow.broadcast`` Action
***************************

This is an :ref:`Action <config-action>` for sending a data packet over the espnow protocol to any device that is listening.

.. code-block:: yaml

    on_...:
      - espnow.broadcast:
          data: "The big angry wolf awakens"
      - espnow.broadcast:
          data: !lambda "return {0x00, 0x00, 0x34, 0x5d};"
      - espnow.broadcast:
          data: [0x00, 0x00, 0x34, 0x5d]

Configuration variables:

- **data** (**Required**, :ref:`templatable <config-templatable>`, string or list of bytes): The data to be sent.


.. _espnow-peer_add-action:

``espnow.peer.add`` Action
**************************

This is an :ref:`Action <config-action>` to add a new peer to the internal allowed peers list.

.. code-block:: yaml

    on_...:
      - espnow.peer.add:
          address: 11:22:33:44:55:66
      - espnow.peer.add:
          address: !lambda "return {0x11, 0x22, 0x33, 0x44, 0x55, 0x66};"


Configuration variables:

- **address** (**Required**, MAC Address): The Peer address that needs to be added to the list of allowed peers.


.. _espnow-peer_delete-action:

``espnow.peer.delete`` Action
*****************************

This is an :ref:`Action <config-action>` to remove a known peer from the internal allowed peers list.

.. code-block:: yaml

    on_...:
      - espnow.peer.delete:
          address: 11:22:33:44:55:66
      - espnow.peer.delete:
          address: !lambda "return {0x11, 0x22, 0x33, 0x44, 0x55, 0x66};"

Configuration variables:

- **address** (**Required**, MAC Address): The Peer address that needs to be removed from the list of allowed peers.


.. _espnow-peers:

Peers
-----

A peer is a device that this device is allowed to send to. Broadcast and unencrypted unicast data can be received from
any device without explicitly adding it as a peer.

If ``auto_add_peer`` is set to ``false`` and you have not added any peers, then only broadcasts can be sent and there
will be an error when trying to send data to a peer.

Setting ``auto_add_peer`` to ``true`` will allow the component to automatically add any incoming device as a peer, and will
automatically add any peer that data is sent to.

See Also
--------

- :apiref:`espnow/espnow.h`
- :ghedit:`Edit`

.. toctree::
    :maxdepth: 1
    :glob:
