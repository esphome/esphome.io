---
description: "Instructions for setting up an ESP-NOW packet transport platform on ESPHome"
title: "ESP-NOW Packet Transport Platform"
params:
  seo:
    description: Instructions for setting up an ESP-NOW packet transport platform on ESPHome
    image: espnow.svg
---

{{< anchor "espnow-packet-transport" >}}

The **ESP-NOW Packet Transport** platform allows ESPHome nodes to communicate directly using the [ESP-NOW protocol](https://www.espressif.com/en/solutions/low-power-solutions/esp-now).  
This enables lightweight, peer-to-peer communication between nodes without Wi-Fi association or IP transport.  
It is ideal for fast, low-power message delivery across multiple ESP32 devices.

This implementation integrates with the core [Packet Transport Component](#packet-transport) interface, allowing data exchange between nodes via standardized packet APIs.

## Example Configuration

```yaml
# Example configuration entry
packet_transport:
  platform: espnow
  peers:
    - mac_address: "24:6F:28:AB:CD:EF"
    - mac_address: "24:6F:28:12:34:56"
  sensors:
    - battery_voltage

espnow:
  wifi_channel: 6
  encryption_key: "0123456789ABCDEF0123456789ABCDEF"
  max_queue_size: 20
  resend_retries: 3
  resend_interval: 200ms
  verbose: false

sensor:
  - platform: adc
    pin: GPIO32
    name: "Battery Voltage"
    id: battery_voltage
```

## Configuration Options

### `peers`
A list of peer devices (by MAC address) that the ESP32 will communicate with.

| Name | Type | Description |
|------|------|--------------|
| **mac_address** | string | MAC address of the remote peer device. |
| **channel** | int (optional) | Wi-Fi channel to use (default matches local `espnow` config). |
| **encryption_key** | string (optional) | Optional per-peer key to override the global key. |

### `espnow`
Defines the ESP-NOW radio transport configuration.

| Name | Type | Description |
|------|------|--------------|
| **wifi_channel** | int | Wi-Fi channel used for all peer communications. Must match across nodes. |
| **encryption_key** | string (optional) | 128-bit key used for encrypted ESP-NOW messages. |
| **max_queue_size** | int (optional) | Number of packets that can be queued for sending (default: 10). |
| **resend_retries** | int (optional) | Number of automatic retransmission attempts (default: 3). |
| **resend_interval** | time (optional) | Delay between retries (default: 100 ms). |
| **verbose** | bool (optional) | Enables detailed debug logs (default: false). |

### `packet_transport`
Links the ESP-NOW transport to the core packet transport framework.

| Name | Type | Description |
|------|------|--------------|
| **platform** | string | Must be set to `"espnow"`. |
| **sensors** | list | List of sensors whose data should be shared between nodes. |

## Advanced Usage

### Peer Management
Peers are automatically registered when defined in the configuration.  
Dynamic registration or removal may also be handled through API calls if runtime discovery is required.

### Reliability
ESP-NOW is a connectionless protocol; reliability is implemented in this component via automatic retries, ACK tracking, and packet sequencing.  
The retry mechanism ensures consistent delivery across noisy RF environments.

### Debugging
Enable `verbose: true` in the `espnow` section to trace peer registration, packet send/receive events, and transmission statistics.

Log example:
```
[V][espnow:284]: <<< [E4:B3:23:C2:76:D8 -> FF:FF:FF:FF:FF:FF] Packet TX (len=42)
[V][espnow:301]: >>> [E4:B3:23:C2:76:D8] Packet RX OK (len=42)
```

### Performance Considerations
- ESP-NOW packets are limited to **250 bytes**.
- Broadcasting consumes more airtime; unicast to peers for reliability.
- Encryption adds latency and reduces maximum packet size slightly.
- Keep the number of peers below 20 for best results.

## See Also

- [Packet Transport Component](#packet-transport)
- {{< docref "/components/wifi" >}}
- {{< docref "/components/binary_sensor/packet_transport" >}}
- {{< docref "/components/sensor/packet_transport" >}}
- [Automation](#automation)
- {{< apiref "packet_transport/espnow_packet_transport.h" "packet_transport/espnow_packet_transport.h" >}}
