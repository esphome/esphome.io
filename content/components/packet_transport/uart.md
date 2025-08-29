---
description: "Instructions for setting up a UART packet transport platform on ESPHome"
title: "UART Packet Transport Platform"
params:
  seo:
    description: Instructions for setting up a UART packet transport platform on ESPHome
    image: uart.svg
---

{{< anchor "uart-packet-transport" >}}

The [Packet Transport Component](#packet-transport) platform allows ESPHome nodes to directly communicate with each over a communication channel.
The UART implementation of the platform uses a serial port as a communication medium. See the [Packet Transport Component](#packet-transport) and [UART Bus](#uart) for more information.

## Example Configuration

```yaml
# Example configuration entry
packet_transport:
  platform: uart
  sensors:
    - dht_temp

uart:
  tx_pin: GPIOXX
  rx_pin: GPIOXX
  baud_rate: 9600

sensor:
  - platform: dht
      id: dht
      pin: GPIOXX
      temperature:
        name: "Temperature"
        id: dht_temp
```

## See Also

- [Packet Transport Component](#packet-transport)
- {{< docref "/components/uart" >}}
- {{< docref "/components/binary_sensor/packet_transport" >}}
- {{< docref "/components/sensor/packet_transport" >}}
- [Automation](#automation)
- {{< apiref "packet_transport/packet_transport.h" "packet_transport/packet_transport.h" >}}
