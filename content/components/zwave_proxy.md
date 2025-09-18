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
[Z-Wave JS](https://zwave-js.github.io/zwave-js/) via ESPHome's {{< docref "/components/api" >}} over
the {{< docref "/components/wifi" >}} or {{< docref "/components/ethernet" >}}. This allows for more flexibility when
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

## Maximizing performance

Low latency is key to achieving an optimal experience with Z-Wave (or any) wireless devices.

It's important to understand that using the `zwave_proxy` *will* increase latency between your Z-Wave devices and
Z-Wave JS -- this is simply the consequence of passing messages from one medium to another.

Under near-ideal conditions:

- With a direct serial connection to the Z-Wave modem SoC, latency may be as low as approximately 20 milliseconds (ms).
- When introducing the Z-Wave proxy component, it's still possible to achieve low latency -- we've seen as low as 35
  ms! however, in practice, it's more realistic to expect 50-60 ms, assuming decent RF conditions.

In general, any duration less than 100 ms is quite acceptable in terms of latency; this value is generally a good
target to keep in mind.

## Maximizing reliability

In addition to low latency, reliability is also critical to an optimal experience.

- While most convenient, Wi-Fi is subject to interference from other, nearby RF devices and environmental conditions.
  These factors can (and do) periodically cause (momentary) instability of the signal. In many cases, Wi-Fi devices
  recover automatically, but this comes at the expense of degraded performance (latency) and, in more extreme cases,
  brief loss of connectivity. This is not desirable for applications such as the Z-Wave proxy and it's important to
  keep in mind as you determine how you'll connect it.
- A wired Ethernet connection will, in all cases, prove more reliable than a Wi-Fi connection for the Z-Wave proxy
  application. It's much more stable and predictable in terms of latency and the connection will not arbitrarily drop
  (unless, of course, you unplug the cable). For this reason, we highly recommend using a wired connection to achieve
  the best experience.

If you choose to use Wi-Fi to bridge your Z-Wave modem to Z-Wave JS:

- Confirm that there is a strong, stable Wi-Fi signal available in the location you'll place your Z-Wave proxy.
- Do not attempt to place your Z-Wave proxy in or near the edge of the coverage area your Wi-Fi router/access point
  provides.
- If you find that your Z-Wave devices are not operating reliably, you might try:
  - moving your Z-Wave proxy closer to your Wi-Fi router/access point.
  - changing the Wi-Fi channel your Wi-Fi router/access point is using.
  - getting a better Wi-Fi router/access point. In particular, many ISP-provided Wi-Fi routers are designed to be
    cost-effective and are not optimized for performance.

## See Also

- {{< docref "/components/api" >}}
- {{< docref "/components/ethernet" >}}
- {{< docref "/components/wifi" >}}
- {{< apiref "zwave_proxy/zwave_proxy.h" "zwave_proxy/zwave_proxy.h" >}}
