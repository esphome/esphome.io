OpenThread Component
=====================

.. seo::
    :description: Instructions for setting up OpenThread component.
    :image: openthread.png

`Thread <https://www.threadgroup.org>`__ is a low-power, mesh-networking standard for IoT devices. The low-power aspect is important for battery-powered devices. It is also low-bandwidth, making it ideal for applications that do not send a lot of data, such as switches or motion sensors.

Thread uses the same RF technology as Zigbee (IEEE 802.15.4) but provides IP connectivity similar to Wi-Fi. Unlike Zigbee, Thread by itself does not specify how devices are controlled; it's just a communication protocol. To control devices which communicate over Thread, a higher-level protocol is required, such as Matter, Apple HomeKit, or :doc:`ESPHome API </components/api>`.

This component adds the ability to communicate over a Thread network. It supports sending the state of sensors and binary sensors to Home Assistant via `6LoWPAN <https://datatracker.ietf.org/wg/6lowpan/documents/>`__ packets.
.. note::

    You'll need a `Thread border router <https://www.home-assistant.io/integrations/thread#about-thread-border-routers>`__ to connect your node to a Thread network.


Usage
-----

This component requires an ESP32 with a Thread-capable radio, such as the ESP32-C6 or ESP32-H2, along with ESP-IDF.

.. code-block:: yaml

    # Example ESP-IDF configuration for ESP32-C6-DevKitM-1 board
    esp32:
      board: esp32-c6-devkitm-1
      framework:
        type: esp-idf

.. _config-openthread:


Configuration examples
----------------------

Here's an example ``openthread`` configuration:

.. code-block:: yaml

    # Example OpenThread component configuration
    network:
      enable_ipv6: true
    
    openthread:
      channel: 13
      network_name: OpenThread-8f28
      network_key: 0xdfd34f0f05cad978ec4e32b0413038ff
      pan_id: 0x8f28
      ext_pan_id: 0xd63e8e3e495ebbc3
      pskc: 0xc23a76e98f1a6483639b1ac1271e2e27
      force_dataset: true

Configuration variables:

- **channel** (int): Channel number from 11 to 26
- **network_name** (string): A human-readable Network Name
- **network_key** (string): OpenThread network key
- **panid** (string): 2-byte Personal Area Network ID (PAN ID)
- **extpanid** (string): 8-byte Extended Personal Area Network ID (XPAN ID)
- **pskc** (string): PSKc is used to authenticate an external Thread Commissioner to a Thread network


Configuration examples with dataset TLV
---------------------------------------

It is also possible to supply the entire Operational Dataset as hex-encoded TLVs obtained from the Thread information in Home Assistant. The individual values will be extracted automatically.

.. code-block:: yaml

    # Example OpenThread TLV value from the Thread information in Home Assistant
    openthread:
      tlv: 0e080000000000010000000300001035060004001fffe00208e227ac6a7f24052f0708fdb753eb517cb4d3051062b2442a928d9ea3b947a1618fc4085a030f4f70656e5468726561642d393837330102987304105330d857354330133c05e1fd7ae81a910c0402a0f7f8

Configuration variables:

- **tlv** (string): dataset TLVs from the Thread information in Home Assistant
