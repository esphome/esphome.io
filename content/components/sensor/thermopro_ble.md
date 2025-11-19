---
description: "Instructions for setting up ThermoPro Bluetooth-based temperature and humidity sensors in ESPHome."
title: "ThermoPro BLE Sensor"
params:
  seo:
    description: Instructions for setting up ThermoPro Bluetooth-based temperature and humidity sensors in ESPHome.
    image: thermopro_tp357.jpg
---

The `thermopro_ble` sensor platform lets you track the output of ThermoPro Bluetooth
Low Energy devices using the {{< docref "/components/esp32_ble_tracker" >}}. This component will track the
temperature, humidity, battery level and signal strength of the ThermoPro device every time the
sensor sends out a BLE broadcast.

> [!NOTE]
> Currently this component is only tested with TP357S devices. However, it should work with TP972, TP970, TP96x and TP3xx.

{{< img src="thermopro_tp357-full.jpg" alt="Image" caption="ThermoPro TP357 Temperature and Humidity Sensor over BLE." width="80.0%" class="align-center" >}}

```yaml
# Example configuration entry
esp32_ble_tracker:

sensor:
  - platform: thermopro_ble
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

- **mac_address** (**Required**, MAC Address): The MAC address of the ThermoPro device.

- **temperature** (*Optional*): The information for the temperature sensor.

  - All options from [Sensor](#config-sensor).

- **external_temperature** (*Optional*): The information for the ambient temperature sensor.
  This is only available on TP972, TP970 and TP96x devices.

  - All options from [Sensor](#config-sensor).

- **humidity** (*Optional*): The information for the humidity sensor
  This is only available on TP3xx devices.

  - All options from [Sensor](#config-sensor).

- **battery_level** (*Optional*): The information for the battery level sensor

  - All options from [Sensor](#config-sensor).

- **signal_strength** (*Optional*): The information about the BT RSSI

  - All options from [Sensor](#config-sensor).

## Setting Up Devices

To set up ThermoPro devices you first need to find their MAC Address so that ESPHome can
identify them. So first, create a simple configuration without any `thermopro_ble` entries
like so:

```yaml
esp32_ble_tracker:
  on_ble_advertise:
    - then:
        - lambda: 'ESP_LOGD("ble_adv", "BLE device address: %s name: %s", x.address_str().c_str(), x.get_name().c_str());'
```

After uploading the ESP32 will immediately try to scan for BLE devices such as the ThermoPro, so
you will see messages like this (please note the TPxxxx model name):

```log
[13:36:43][D][ble_adv:042]: BLE device address: XX:XX:XX:XX:XX:XX name: TP357S (XXXX)
```

Note that it can sometimes take some time for the first BLE broadcast to be received.

Then just copy the address (`XX:XX:XX:XX:XX:XX`) into a new `sensor.thermopro_ble` platform
entry like in the configuration example at the top.

> [!NOTE]
> The ThermoPro BLE component listens passively to packets the device sends by itself.
> ESPHome therefore has no impact on the battery life of the device.

## See Also

- {{< docref "/components/esp32_ble_tracker" >}}
- {{< docref "/components/sensor" >}}
- {{< docref "absolute_humidity/" >}}
- {{< apiref "thermopro_ble/thermopro_ble.h" "thermopro_ble/thermopro_ble.h" >}}
