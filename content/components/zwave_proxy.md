---
description: "Instructions for setting up the Z-Wave Proxy in ESPHome."
title: "Z-Wave Proxy"
params:
  seo:
    description: Instructions for setting up the Z-Wave Proxy in ESPHome.
    image: z-wave.svg
---

The `zwave_proxy` component allows proxying of Z-Wave data frames between a
[Z-Wave Modem SoC](https://www.silabs.com/wireless/z-wave/800-series-modem-soc) and
[Z-Wave JS](https://github.com/zwave-js) via ESPHome's {{< docref "/components/api" >}} over
{{< docref "/components/wifi" >}} or {{< docref "/components/ethernet" >}}. This allows for more flexibility when
placing your Z-Wave hardware within your home.

As the Z-Wave modem SoC communicates via a serial connection, you need to have a [UART](#uart) defined in your ESPHome
device's configuration.

In addition, the `zwave_proxy` expects to proxy messages via ESPHome's {{< docref "/components/api" >}}; this is also
required in your configuration.

{{< note >}}
Number of connections

While ESPHome supports multiple API connections/clients, only a single client may subscribe to and receive proxied
Z-Wave data frames at any given time.

{{< /note >}}

## Configuration

```yaml
# Example configuration entry
zwave_proxy:
```

- **id** (*Optional*, [ID](#config-id)): Manually specify the ID for the `zwave_proxy`.

## See Also

- {{< docref "/components/api" >}}
- {{< docref "/components/ethernet" >}}
- {{< docref "/components/wifi" >}}
- {{< apiref "zwave_proxy/zwave_proxy.h" "zwave_proxy/zwave_proxy.h" >}}
