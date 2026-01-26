---
title: UDP Packet Transport Platform
description: Instructions for setting up a udp packet transport platform on ESPHome
seo:
  description: Instructions for setting up a udp packet transport platform on ESPHome
  image: udp.svg
---

::anchor{#udp-packet-transport}

The [packet_transport](/components/packet_transport) platform allows ESPHome nodes to directly communicate with each over a communication channel.
The UDP implementation of the platform uses UDP as a communication medium. See the [packet_transport](/components/packet_transport) and [udp](/components/udp) for more information.

## Example Configuration

```yaml
# Example configuration entry
packet_transport:
  platform: udp
  sensors:
    - dht_temp

udp:

sensor:
  - platform: dht
      id: dht
      pin: GPIOXX
      temperature:
        name: "Temperature"
        id: dht_temp
```

## See Also

- [packet_transport](/components/packet_transport)
- [udp](/components/udp)
- [packet_transport](/components/binary_sensor/packet_transport)
- [packet_transport](/components/sensor/packet_transport)
- [automations](/automations)
- ::apiref{text="packet_transport/packet_transport.h" path="packet_transport/packet_transport.h"}
