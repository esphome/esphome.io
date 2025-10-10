---
description: "Instructions for setting up an ESP-NOW packet transport platform on ESPHome"
title: "ESP-NOW Packet Transport Platform"
params:
  seo:
    description: Instructions for setting up an ESP-NOW packet transport platform on ESPHome
    image: espnow.svg
---

{{< anchor "espnow-packet-transport" >}}

The [Packet Transport Component](#packet-transport) platform allows ESPHome nodes to directly communicate with each over a communication channel. The ESP-NOW implementation of the platform uses ESP-NOW as a communication medium. See the [Packet Transport Component](#packet-transport) and {{< docref "/components/espnow" >}} for more information.

ESP-NOW provides low-latency, low-power wireless communication between ESP32 devices without requiring a Wi-Fi connection. This makes it ideal for battery-powered sensors or applications where Wi-Fi overhead would impact performance.

> **Note:**  
> ESP-NOW communication occurs independently of Wi-Fi. Devices can communicate via ESP-NOW even when Wi-Fi is disabled, making it suitable for power-sensitive applications.

## Example Configuration

```yaml
# Example configuration entry
espnow:
  id: espnow_component

packet_transport:
  - platform: espnow
    id: transport_broadcast
    espnow_id: espnow_component
    # Uses default broadcast address FF:FF:FF:FF:FF:FF
    encryption:
      key: "0123456789abcdef0123456789abcdef"
    sensors:
      - temp_sensor

  - platform: espnow
    id: transport_unicast
    espnow_id: espnow_component
    peer_address: "AA:BB:CC:DD:EE:FF"
    encryption:
      key: "0123456789abcdef0123456789abcdef"
    sensors:
      - temp_sensor

sensor:
  - platform: internal_temperature
    id: temp_sensor
    name: "Test Temperature"
```

## Configuration Variables

| Name                | Type                     | Default             | Description                                                                                            |
|---------------------|--------------------------|---------------------|--------------------------------------------------------------------------------------------------------|
| `peer_address`      | MAC Address *(optional)* | `FF:FF:FF:FF:FF:FF` | MAC address to send packets to. This can be either a specific peer address for point-to-point communication, or the broadcast address `FF:FF:FF:FF:FF:FF` for broadcasting to all registered peers. |
| *All other options* | —                        | —                   | From the [Packet Transport Component](#packet-transport).                                               |

> **Note:**  
> Peers must be registered with the {{< docref "/components/espnow" >}} component before they can receive packets. The `peer_address` only controls which peer(s) receive transmitted data; incoming packets are accepted from all registered peers.

## Broadcast vs Unicast

The `peer_address` configuration determines the transmission mode.

### Broadcast Mode (default)

```yaml
packet_transport:
  - platform: espnow
    # peer_address: "FF:FF:FF:FF:FF:FF"  # Default, can be omitted
    sensors:
      - sensor_id
```

All devices with the broadcast address (`FF:FF:FF:FF:FF:FF`) registered as a peer will receive the packets. This is useful for hub-and-spoke topologies where multiple devices monitor a single sensor source.

> **Warning:**  
> Using broadcast mode increases ESP-NOW traffic on the radio channel, which may impact performance of other ESP-NOW devices in range. Use specific peer addresses whenever possible to minimize interference.

### Unicast Mode

```yaml
packet_transport:
  - platform: espnow
    peer_address: "AA:BB:CC:DD:EE:FF"
    sensors:
      - sensor_id
```

Only the specified peer receives the packets. This is more efficient for point-to-point communication and reduces radio channel congestion for neighboring ESP-NOW devices.

## Complete Example

This example shows two devices exchanging sensor data over ESP-NOW with encryption enabled.

### Device 1 – Temperature Sensor Provider

```yaml
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
  - platform: ...
    temperature:
      name: "Outdoor Temperature"
      id: outdoor_temp
```

### Device 2 – Temperature Display Consumer

```yaml
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
```

## Multi-Device Hub Example

This example shows a central hub receiving sensor data from multiple remote devices.

### Hub Device

```yaml
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
```

### Remote Sensor (repeat for each room)

```yaml
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
  - platform: ...
    temperature:
      id: temperature
```

## Power-Efficient OTA Updates

This component opens opportunities - as an example, ESP-NOW could be used to remotely enable Wi-Fi for OTA updates, keeping Wi-Fi disabled during normal operation for better performance.

### Remote Device (Wi-Fi normally disabled)

```yaml
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
```

### Controller Device

```yaml
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
```

## Performance Considerations

* **Maximum Packet Size:** ESP-NOW has a maximum packet size of 250 bytes. The packet transport component will automatically handle this limitation.
* **Throughput:** ESP-NOW provides lower throughput than Wi-Fi but has significantly lower latency (typically <10ms vs 50-100ms for Wi-Fi).
* **Range:** ESP-NOW typically provides similar range to Wi-Fi (50-100 meters line-of-sight), but this varies based on environment and antenna configuration.
* **Power Consumption:** ESP-NOW consumes significantly less power than maintaining a Wi-Fi connection, making it ideal for battery-powered applications.
* **Channel:** ESP-NOW operates on the same 2.4GHz channels as Wi-Fi. When Wi-Fi is enabled, ESP-NOW automatically uses the same channel. When Wi-Fi is disabled, ESP-NOW uses channel 1 by default.

## Limitations

* **ESP32 Only:** ESP-NOW is only available on ESP32, ESP32-S2, ESP32-S3, and ESP32-C3 chips. ESP8266 support is not available.
* **Peer Limit:** ESP32 devices can register a maximum of 20 peers (10 encrypted + 10 unencrypted, or various combinations).
* **Packet Size:** Maximum 250 bytes per packet, which limits the amount of sensor data that can be transmitted in a single update.
* **No Routing:** ESP-NOW is not a mesh protocol. Devices communicate directly and cannot route packets through intermediate nodes.

## See Also

* [Packet Transport Component](#packet-transport)
* {{< docref "/components/espnow" >}}
* {{< docref "/components/binary_sensor/packet_transport" >}}
* {{< docref "/components/sensor/packet_transport" >}}
* [UDP Packet Transport](#udp-packet-transport)
* [Automation](#automation)
* {{< apiref "packet_transport/espnow_transport.h" "packet_transport/espnow_transport.h" >}}
