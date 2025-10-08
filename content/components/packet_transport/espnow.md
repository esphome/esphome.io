# ESP-NOW Packet Transport Platform

The [Packet Transport Component](#packet_transport) platform allows ESPHome nodes to directly communicate with each other over a communication channel.

The **ESP-NOW** implementation of this platform uses ESP-NOW as the communication medium. See the
[Packet Transport Component](#acket_transport) and [ESP-NOW Component](#espnow) for more information.

ESP-NOW provides low-latency, low-power wireless communication between ESP32 devices without requiring a Wi-Fi connection.
This makes it ideal for battery-powered sensors or applications where Wi-Fi overhead would impact performance.

> **Note:**
> ESP-NOW communication occurs independently of Wi-Fi.
> Devices can communicate via ESP-NOW even when Wi-Fi is disabled, making it suitable for power-sensitive applications.

---

## Example Configuration

```yaml
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
```

---

## Configuration Variables

| Name                | Type                     | Default             | Description                                                                                            |
| ------------------- | ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------ |
| `peer_address`      | MAC Address *(optional)* | `FF:FF:FF:FF:FF:FF` | MAC address to send packets to. May be a specific peer (unicast) or broadcast to all registered peers. |
| *All other options* | —                        | —                   | From the [Packet Transport Component](/components/packet_transport).                                   |

> **Note:**
> Peers must be registered with the [ESP-NOW Component](/components/espnow) before they can receive packets.
> The `peer_address` only controls which peer(s) receive transmitted data; incoming packets are accepted from all registered peers.

---

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

All devices with the broadcast address (`FF:FF:FF:FF:FF:FF`) registered as a peer will receive the packets.
Useful for **hub-and-spoke** topologies where multiple devices monitor a single sensor source.

### Unicast Mode

```yaml
packet_transport:
  - platform: espnow
    peer_address: "AA:BB:CC:DD:EE:FF"
    sensors:
      - sensor_id
```

Only the specified peer receives the packets.
This is more efficient for **point-to-point** communication.

---

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
  - platform: dht
    pin: GPIO4
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

---

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
  - platform: dht
    pin: GPIO4
    temperature:
      id: temperature
```

---

## Power-Efficient OTA Updates

ESP-NOW can be used to remotely enable Wi-Fi for OTA updates, keeping Wi-Fi disabled during normal operation for better power performance.

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

---

## Performance Considerations

* **Maximum Packet Size:** ESP-NOW packets are limited to **250 bytes**. The packet transport component automatically handles this.
* **Throughput:** ESP-NOW provides lower throughput than Wi-Fi but with significantly lower latency (<10 ms typical vs 50–100 ms).
* **Range:** Typically **50–100 m line-of-sight**, similar to Wi-Fi.
* **Power Consumption:** Far lower than maintaining a Wi-Fi connection — ideal for battery devices.
* **Channel:** Uses the same 2.4 GHz channels as Wi-Fi. When Wi-Fi is disabled, defaults to channel 1.

---

## Limitations

* **ESP32-only:** Available on ESP32, ESP32-S2, ESP32-S3, and ESP32-C3.
  Not supported on ESP8266.
* **Peer Limit:** Up to 20 peers total (10 encrypted + 10 unencrypted, or combinations).
* **Packet Size:** Maximum 250 bytes per packet.
* **No Routing:** ESP-NOW is not a mesh protocol; devices communicate directly only.

---

## See Also

* [Packet Transport Component](#packet_transport)
* [ESP-NOW Component](#espnow)
* [UDP Packet Transport](#packet_transport/udp)
* [espnow_transport.h (API Reference)](/api/espnow/packet_transport/espnow_transport.h)
* [Edit on GitHub](https://github.com/esphome/esphome/edit/dev/esphome/components/packet_transport/espnow_transport.md)

---
