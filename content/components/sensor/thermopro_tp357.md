---
description: "Instructions for setting up ThermoPro TP357 Bluetooth-based temperature and humidity sensors in ESPHome."
title: "ThermoPro TP357 BLE Sensor"
params:
  seo:
    description: Instructions for setting up ThermoPro TP357 Bluetooth-based temperature and humidity sensors in ESPHome.
    image: thermopro_tp357.jpg
---

The `thermopro_tp357` sensor platform lets you track the output of ThermoPro TP357 Bluetooth
Low Energy devices using the {{< docref "/components/esp32_ble_tracker" >}}. This component will track the
temperature, humidity, battery level and signal strength of the TP357 device every time the
sensor sends out a BLE broadcast.

{{< img src="thermopro_tp357-full.jpg" alt="Image" caption="ThermoPro TP357 Temperature and Humidity Sensor over BLE." width="80.0%" class="align-center" >}}

```yaml
# Example configuration entry
esp32_ble_tracker:

sensor:
  - platform: thermopro_tp357
    mac_address: XX:XX:XX:XX:XX:XX
    temperature:
      name: "ThermoPro Temperature"
    humidity:
      name: "ThermoPro Humidity"
    battery_level:
      name: "ThermoPro Battery Level"
    signal_strength:
      name: "ThermoPro Signal Strength"
```

## Configuration variables

- **mac_address** (**Required**, MAC Address): The MAC address of the ThermoPro TP357 device.
- **temperature** (*Optional*): The information for the temperature sensor.

  - All options from [Sensor](#config-sensor).

- **humidity** (*Optional*): The information for the humidity sensor

  - All options from [Sensor](#config-sensor).

- **battery_level** (*Optional*): The information for the battery level sensor

  - All options from [Sensor](#config-sensor).

- **signal_strength** (*Optional*): The information about the BT RSSI

  - All options from [Sensor](#config-sensor).

## Setting Up Devices

To set up ThermoPro TP357 devices you first need to find their MAC Address so that ESPHome can
identify them. So first, create a simple configuration without any `thermopro_tp357` entries
like so:

```yaml
esp32_ble_tracker:
  on_ble_advertise:
    - then:
        - lambda: 'ESP_LOGD("ble_adv", "BLE device address: %s name: %s", x.address_str().c_str(), x.get_name().c_str());'
```

After uploading the ESP32 will immediately try to scan for BLE devices such as the ThermoPro TP357, so
you will see messages like this (please note the TP357S name):

```log
13:31:53	[D]	[ble_adv:042]	BLE device address: XX:XX:XX:XX:XX:XX name: TP357S (XXXX)
```

Note that it can sometimes take some time for the first BLE broadcast to be received.

Then just copy the address (`XX:XX:XX:XX:XX:XX`) into a new `sensor.thermopro_tp357` platform
entry like in the configuration example at the top.

> [!NOTE]
> The ThermoPro TP357 component listens passively to packets the device sends by itself.
> ESPHome therefore has no impact on the battery life of the device.

## See Also

- {{< docref "/components/esp32_ble_tracker" >}}
- {{< docref "/components/sensor" >}}
- {{< docref "absolute_humidity/" >}}
- {{< apiref "thermopro_tp357/thermopro_tp357.h" "thermopro_tp357/thermopro_tp357.h" >}}
