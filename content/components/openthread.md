---
description: "Instructions for setting up OpenThread component."
title: "OpenThread Component"
params:
  seo:
    description: Instructions for setting up OpenThread component.
    image: openthread.png
---

[Thread](https://www.threadgroup.org) is a low-power mesh networking standard for IoT devices. The low-power aspect is important for battery-powered smart home devices. However, it’s also low-bandwidth, making it ideal for applications that don’t send a lot of data, like switches or motion sensors.

Thread uses the same RF technology as Zigbee (IEEE 802.15.4), but provides IPv6 connectivity similar to Wi-Fi. Unlike Zigbee, Thread by itself does not allow controlling devices: It is just a communication protocol. To control the Thread devices, a higher-level protocol is required: Matter or Apple HomeKit or {{< docref "/components/api" "ESPHome API" >}}.

This component allows ESPHome nodes to communicate with Home Assistant over a Thread network. It permits sending sensor state to Home Assistant and receiving {{< docref "/components/ota/index" "Over-the-Air Updates (OTA)" >}}. This OpenThread component relies on [OpenThread](https://openthread.io) which is an open-source implementation of Thread.

> [!NOTE]
> You will need a [Thread border router](https://www.home-assistant.io/integrations/thread#about-thread-border-routers) to connect your node to a Thread network. The border router adapts IPv6 packets on your Home Assistant network to 6LoWPAN packets on your Thread network, allowing communication across both networks.

## Usage

This component requires an ESP32 (ESP32-C5, ESP32-C6, or ESP32-H2 because they have Thread radio chip) and the use of
ESP-IDF.

```yaml
# Example ESP-IDF configuration for ESP32-C6-DevKitM-1 board
esp32:
  board: esp32-c6-devkitm-1
  framework:
    type: esp-idf
```

{{< anchor "config-openthread" >}}

## Full Configuration

This example show how to configure Thread Dataset for a node.

```yaml
# Example OpenThread component configuration
network:
  enable_ipv6: true

openthread:
  device_type: FTD
  channel: 13
  network_name: OpenThread-8f28
  network_key: 0xdfd34f0f05cad978ec4e32b0413038ff
  pan_id: 0x8f28
  ext_pan_id: 0xd63e8e3e495ebbc3
  pskc: 0xc23a76e98f1a6483639b1ac1271e2e27
  mesh_local_prefix: fd53:145f:ed22:ad81::/64
  force_dataset: true
```

### Configuration variables

- **device_type** (*Optional*, enum): OpenThread Device Type, either `FTD` or `MTD`. Defaults to `FTD`.
- **channel** (int): Channel number from 11 to 26
- **network_name** (string): A human-readable Network Name
- **network_key** (string): OpenThread network key
- **pan_id** (string): 2-byte Personal Area Network ID (PAN ID)
- **ext_pan_id** (string): 8-byte Extended Personal Area Network ID (XPAN ID)
- **pskc** (string): PSKc is used to authenticate an external Thread Commissioner to a Thread network
- **mesh_local_prefix** (ipv6network): Used to build Mesh-Local IPv6 addresses (ML-EIDs), which are unique to each Thread device within the network partition
- **force_dataset** (*Optional*, bool): Forces ESPHome configuration to override any previously stored OpenThread
  network dataset on the device, ensuring configured parameters are always applied at startup. Defaults to `false`
- **use_address** (*Optional*, string): Manually override what address to use to connect
  to the ESP. Defaults to auto-generated value.
- **poll_period** (*Optional*, [Time](/guides/configuration-types#config-time)): When Poll_Period is set on an MTD device, the parent router will enqueue any messages and wait for the child to submit a poll data request

## Dataset TLV Configuration

It is also possible to supply the entire dataset TLVs from the Thread information in Home Assistant and the individual values will be automatically extracted from it.

```yaml
# Example OpenThread TLV value from the Thread information in Home Assistant
openthread:
  tlv: 0e080000000000010000000300001035060004001fffe00208e227ac6a7f24052f0708fdb753eb517cb4d3051062b2442a928d9ea3b947a1618fc4085a030f4f70656e5468726561642d393837330102987304105330d857354330133c05e1fd7ae81a910c0402a0f7f8
```

### Configuration variables

- **tlv** (string): dataset TLVs from the Thread information in Home Assistant

## `openthread.radio` Action

If poll_period > 0, then this action can either turn the radio on all the time or turn it off when idle.

```yaml
on_...:
  then:
  # Long form turns radio on all the time
    - openthread.radio:
        keep_radio_on: true
  # Short form turns radio off when idle
    - openthread.radio:
  # Short form turns radio off when idle
    - openthread.radio: false
  # Short form turns radio on all the time
    - openthread.radio: true
```

### Configuration variables

- **keep_radio_on** (*Optional*, bool): defaults to False;  If poll_period is not set or equal to 0, then this action doesn't do anything.

## OpenThread Device Type

See <https://openthread.io/guides/thread-primer/node-roles-and-types>

- **FTD** - Full Thread Device, sets CONFIG_OPENTHREAD_FTD, observed behavior is that this enables a REED (Router Eligible End Device) and can be promoted to a Router.
- **MTD** - Minimal Thread Device, sets CONFIG_OPENTHREAD_MTD, cannot be promoted to Router. Switching back from MTD to FTD will not result in a REED unless Non Volatile Storage (NVS) is cleared.

## Sleepy End Device (SED)

The Poll Period makes the device behave as a SED.  Follow on work is needed utilizing Power Management and/or Light Sleep capability in esp-idf.
If the device is always awake, the API timeout is 60 seconds, so a ping request will force interaction with the parent when the poll period is greater than 60 seconds.

### OTA on a SED

When using OTA, the radio must be always on so that the parent router will transfer data packets immediately rather than waiting for a data request from the SED.
Below is an example of using a switch that would be turned on prior to attempting using OTA.

```yaml
switch:
  - platform: template
    name: "Radio Always On"
    optimistic: true
    restore_mode: RESTORE_DEFAULT_OFF
    turn_on_action:
      then:
        - logger.log: "Set Radio Always On"
        - openthread.radio: true

    turn_off_action:
      then:
        - logger.log: "Set Radio Off When Idle"
        - openthread.radio: false
```

Alternatively, if you have configured http_request.ota instead

```yaml
button:
  - platform: template
    name: "OTA Http Request Update"
    on_press:
      then:
        - openthread.radio: true
        - logger.log: "Begin OTA Flash"
         # This is a local webserver, ota.http_request over openthread
        - ota.http_request.flash:
            md5_url: http://192.168.1.42:8000/${name}/.pioenvs/${name}/firmware.md5
            url: http://192.168.1.42:8000/${name}/.pioenvs/${name}/firmware.ota.bin
        - openthread.radio: false
```

## See Also

- {{< docref "/components/text_sensor/openthread_info" >}}
- {{< docref "/components/network" >}}
- {{< apiref "openthread/openthread.h" "openthread/openthread.h" >}}
- <https://openthread.io/>
