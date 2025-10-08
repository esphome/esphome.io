ESP-NOW Packet Transport Platform
===================================

The :doc:`Packet Transport Component </components/packet_transport>` platform allows ESPHome nodes to directly 
communicate with each over a communication channel.

The ESP-NOW implementation of the platform uses ESP-NOW as a communication medium. See the 
:doc:`Packet Transport Component </components/packet_transport>` and :doc:`ESP-NOW Component </components/espnow>` 
for more information.

ESP-NOW provides low-latency, low-power wireless communication between ESP32 devices without requiring a WiFi 
connection. This makes it ideal for battery-powered sensors or applications where WiFi overhead would impact 
performance.

.. note::

    ESP-NOW communication occurs independently of WiFi. Devices can communicate via ESP-NOW even when WiFi is 
    disabled, making it suitable for power-sensitive applications.

Example Configuration
---------------------

.. code-block:: yaml

    # Example configuration entry
    espnow:
      peers:
        - mac_address: "AA:BB:CC:DD:EE:FF"
          # Optional peer configuration

    packet_transport:
      - platform: espnow
        peer_address: "AA:BB:CC:DD:EE:FF"
        sensors:
          - dht_temp

    sensor:
      - platform: dht
        id: dht
        pin: GPIO4
        temperature:
          name: "Temperature"
          id: dht_temp

Configuration Variables
------------------------

- **peer_address** (*Optional*, MAC Address): The MAC address to send packets to. This can be either a specific 
  peer address for point-to-point communication, or the broadcast address ``FF:FF:FF:FF:FF:FF`` for broadcasting to 
  all registered peers. Defaults to ``FF:FF:FF:FF:FF:FF``.

- All other options from :doc:`Packet Transport Component </components/packet_transport>`.

.. note::

    Peers must be registered with the :doc:`ESP-NOW Component </components/espnow>` before they can receive packets. 
    The ``peer_address`` only controls which peer(s) receive transmitted data; incoming packets are accepted from all 
    registered peers.

Broadcast vs Unicast
--------------------

The ``peer_address`` configuration determines the transmission mode:

**Broadcast Mode** (default):

.. code-block:: yaml

    packet_transport:
      - platform: espnow
        # peer_address: "FF:FF:FF:FF:FF:FF"  # Default, can be omitted
        sensors:
          - sensor_id

All devices with the broadcast address (``FF:FF:FF:FF:FF:FF``) registered as a peer will receive the packets. 
This is useful for hub-and-spoke topologies where multiple devices monitor a single sensor source.

**Unicast Mode**:

.. code-block:: yaml

    packet_transport:
      - platform: espnow
        peer_address: "AA:BB:CC:DD:EE:FF"
        sensors:
          - sensor_id

Only the specified peer receives the packets. This is more efficient for point-to-point communication

Complete Example
----------------

This example shows two devices exchanging sensor data over ESP-NOW with encryption enabled:

.. code-block:: yaml

    # Device 1 - Temperature Sensor Provider
    esphome:
      name: temp-sensor

    espnow:
      peers:
        - mac_address: "AA:BB:CC:DD:EE:01"  # Device 2

    packet_transport:
      - platform: espnow
        peer_address: "AA:BB:CC:DD:EE:01"  # Send to Device 2
        encryption: "MySecretKey123"
        sensors:
          - outdoor_temp

    sensor:
      - platform: dht
        pin: GPIO4
        temperature:
          name: "Outdoor Temperature"
          id: outdoor_temp

.. code-block:: yaml

    # Device 2 - Temperature Display Consumer
    esphome:
      name: temp-display

    espnow:
      peers:
        - mac_address: "AA:BB:CC:DD:EE:00"  # Device 1

    packet_transport:
      - platform: espnow
        encryption: "MySecretKey123"
        providers:
          - name: temp-sensor

    sensor:
      - platform: packet_transport
        provider: temp-sensor
        id: remote_temp
        remote_id: outdoor_temp
        name: "Remote Outdoor Temperature"

Multi-Device Hub Example
------------------------

This example shows a central hub receiving sensor data from multiple remote devices:

.. code-block:: yaml

    # Hub Device
    esphome:
      name: sensor-hub

    espnow:
      peers:
        - mac_address: "FF:FF:FF:FF:FF:FF"  # Broadcast address

    packet_transport:
      - platform: espnow
        encryption: "HubSecret123"
        providers:
          - name: room-sensor-1
          - name: room-sensor-2
          - name: outdoor-sensor

    sensor:
      - platform: packet_transport
        provider: room-sensor-1
        remote_id: temperature
        name: "Room 1 Temperature"

      - platform: packet_transport
        provider: room-sensor-2
        remote_id: temperature
        name: "Room 2 Temperature"

      - platform: packet_transport
        provider: outdoor-sensor
        remote_id: temperature
        name: "Outdoor Temperature"

.. code-block:: yaml

    # Remote Sensor (repeat for each room)
    esphome:
      name: room-sensor-1

    espnow:
      peers:
        - mac_address: "FF:FF:FF:FF:FF:FF"  # Broadcast

    packet_transport:
      - platform: espnow
        peer_address: "FF:FF:FF:FF:FF:FF"  # Broadcast to hub
        encryption: "HubSecret123"
        sensors:
          - temperature

    sensor:
      - platform: dht
        pin: GPIO4
        temperature:
          id: temperature

Power-Efficient OTA Updates
----------------------------

ESP-NOW can be used to remotely enable WiFi for OTA updates, keeping WiFi disabled during normal operation for 
better performance:

.. code-block:: yaml

    # Remote device with WiFi normally disabled
    esphome:
      name: remote-device
      on_boot:
        priority: -100
        then:
          - wifi.disable:  # Disable WiFi on boot

    wifi:
      ssid: !secret wifi_ssid
      password: !secret wifi_password

    api:
    ota:

    espnow:
      peers:
        - mac_address: "AA:BB:CC:DD:EE:FF"  # Controller MAC

    packet_transport:
      - platform: espnow
        id: espnow_transport
        on_packet:
          - lambda: |-
              // Command protocol: 0x01 = enable WiFi, 0x02 = disable WiFi
              if (data.size() >= 1) {
                if (data[0] == 0x01) {
                  ESP_LOGI("ota", "Enabling WiFi for OTA");
                  wifi::global_wifi_component->set_enabled(true);
                } else if (data[0] == 0x02) {
                  ESP_LOGI("ota", "Disabling WiFi");
                  wifi::global_wifi_component->set_enabled(false);
                }
              }

.. code-block:: yaml

    # Controller device
    button:
      - platform: template
        name: "Enable OTA Mode"
        on_press:
          - lambda: |-
              std::vector<uint8_t> cmd = {0x01};
              id(espnow_transport)->send_packet(cmd);

      - platform: template
        name: "Disable OTA Mode"
        on_press:
          - lambda: |-
              std::vector<uint8_t> cmd = {0x02};
              id(espnow_transport)->send_packet(cmd);

Performance Considerations
--------------------------

- **Maximum Packet Size**: ESP-NOW has a maximum packet size of 250 bytes. The packet transport component will 
  automatically handle this limitation.

- **Throughput**: ESP-NOW provides lower throughput than WiFi but has significantly lower latency (typically 
  <10ms vs 50-100ms for WiFi).

- **Range**: ESP-NOW typically provides similar range to WiFi (50-100 meters line-of-sight), but this varies 
  based on environment and antenna configuration.

- **Power Consumption**: ESP-NOW consumes significantly less power than maintaining a WiFi connection, making it 
  ideal for battery-powered applications.

- **Channel**: ESP-NOW operates on the same 2.4GHz channels as WiFi. When WiFi is enabled, ESP-NOW automatically 
  uses the same channel. When WiFi is disabled, ESP-NOW uses channel 1 by default.

Limitations
-----------

- **ESP32 Only**: ESP-NOW is only available on ESP32, ESP32-S2, ESP32-S3, and ESP32-C3 chips. ESP8266 support 
  is not available.

- **Peer Limit**: ESP32 devices can register a maximum of 20 peers (10 encrypted + 10 unencrypted, or various 
  combinations).

- **Packet Size**: Maximum 250 bytes per packet, which limits the amount of sensor data that can be transmitted 
  in a single update.

- **No Routing**: ESP-NOW is not a mesh protocol. Devices communicate directly and cannot route packets through 
  intermediate nodes.

See Also
--------

- :doc:`Packet Transport Component </components/packet_transport>`
- :doc:`ESP-NOW Component </components/espnow>`
- :doc:`UDP Packet Transport </components/packet_transport/udp>`
- :apiref:`espnow/packet_transport/espnow_transport.h`
- :ghedit:`Edit`
