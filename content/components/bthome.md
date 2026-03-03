---
description: "Instructions for setting up BTHome BLE sensor broadcasting on ESP32 devices."
title: "BTHome BLE"
params:
  seo:
    description: Instructions for setting up BTHome v2 BLE sensor broadcasting on ESP32 devices.
    image: bluetooth.svg
---

The `bthome` component enables your ESP32 device to broadcast sensor data using the [BTHome v2](https://bthome.io/) Bluetooth Low Energy (BLE) protocol. This allows your ESP32 to function as a battery-powered BLE sensor that can be automatically discovered and integrated with Home Assistant and other BTHome-compatible receivers.

BTHome is a standardized format for transmitting sensor data over BLE advertising packets, providing efficient, low-power communication for IoT devices.

> [!WARNING]
> The BLE software stack on the ESP32 consumes a significant amount of RAM on the device.
>
> **Crashes are likely to occur** if you include too many additional components in your device's
> configuration. Memory-intensive components such as [Voice Assistant](/components/voice_assistant) and other
> audio components are most likely to cause issues.

> [!NOTE]
> This component requires the [ESP32 BLE](/components/esp32_ble) component to be configured. The BTHome component will automatically enable BLE advertising.

```yaml
# Example configuration entry
esp32_ble:

bthome:
  sensors:
    - type: temperature
      id: my_temperature
    - type: humidity
      id: my_humidity
    - type: battery
      id: my_battery
  binary_sensors:
    - type: motion
      id: my_motion
      advertise_immediately: true
```

## Configuration variables

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID for code generation.
- **esp32_ble_id** (*Optional*, [ID](/guides/configuration-types#id)): The ID of the [ESP32 BLE](/components/esp32_ble) component. Defaults to the only `esp32_ble` component if only one is configured.

- **min_interval** (*Optional*, [Time](/guides/configuration-types#time)): The minimum BLE advertising interval in milliseconds. Setting this less than `max_interval` gives the BLE hardware a better chance to avoid collisions with other BLE transmissions. Range: 20ms to 10,240ms. Defaults to `1s`.

- **max_interval** (*Optional*, [Time](/guides/configuration-types#time)): The maximum BLE advertising interval in milliseconds. Setting this greater than `min_interval` gives the BLE hardware a better chance to avoid collisions with other BLE transmissions. Range: 20ms to 10,240ms. Defaults to `1s`.

- **tx_power** (*Optional*, int): The transmit power of the BLE advertisements in dBm. One of -12, -9, -6, -3, 0, 3, 6, 9. Defaults to `3dBm`.

- **encryption_key** (*Optional*, string): A 32-character hexadecimal string (16 bytes) used for AES-CCM encryption of the BLE advertisements. Spaces and dashes in the key are ignored. When set, all sensor data will be encrypted. Example: `"0123456789ABCDEF0123456789ABCDEF"` or `"01-23-45-67-89-AB-CD-EF-01-23-45-67-89-AB-CD-EF"`.

- **sensors** (*Optional*, list): A list of sensors to broadcast. Each sensor requires:
  - **type** (**Required**, string): The BTHome sensor type (see [Supported Sensor Types](#supported-sensor-types)).
  - **id** (**Required**, [ID](/guides/configuration-types#id)): The ID of an existing sensor component.
  - **advertise_immediately** (*Optional*, boolean): When set to `true`, the component will immediately broadcast an advertisement when this sensor's value changes, rather than waiting for the next scheduled advertisement. Useful for time-sensitive sensors. Defaults to `false`.

- **binary_sensors** (*Optional*, list): A list of binary sensors to broadcast. Each binary sensor requires:
  - **type** (**Required**, string): The BTHome binary sensor type (see [Supported Binary Sensor Types](#supported-binary-sensor-types)).
  - **id** (**Required**, [ID](/guides/configuration-types#id)): The ID of an existing binary sensor component.
  - **advertise_immediately** (*Optional*, boolean): When set to `true`, the component will immediately broadcast an advertisement when this binary sensor's state changes. Particularly useful for motion detectors, door sensors, and other event-driven sensors. Defaults to `false`.

## Supported Sensor Types

The following sensor types are supported by the BTHome protocol. Type names are case-insensitive:

- `battery` - Battery level (%)
- `temperature` - Temperature (°C)
- `humidity` - Humidity (%)
- `pressure` - Pressure (hPa)
- `illuminance` - Illuminance (lux)
- `weight` - Weight (kg)
- `dewpoint` - Dew point (°C)
- `energy` - Energy (kWh)
- `power` - Power (W)
- `voltage` - Voltage (V)
- `pm2_5` - Particulate Matter 2.5 (µg/m³)
- `pm10` - Particulate Matter 10 (µg/m³)
- `co2` - Carbon Dioxide (ppm)
- `tvoc` - Total Volatile Organic Compounds (µg/m³)
- `moisture` - Moisture (%)
- `current` - Current (A)
- `speed` - Speed (m/s)
- `timestamp` - Timestamp (seconds since epoch)

## Supported Binary Sensor Types

The following binary sensor types are supported. Type names are case-insensitive:

- `generic` - Generic on/off
- `power` - Power state
- `battery_low` - Low battery warning
- `battery_charging` - Battery charging status
- `carbon_monoxide` - Carbon monoxide detected
- `cold` - Cold temperature detected
- `door` - Door open/closed
- `garage_door` - Garage door open/closed
- `light` - Light detected
- `lock` - Lock state
- `motion` - Motion detected
- `occupancy` - Occupancy detected
- `smoke` - Smoke detected
- `window` - Window open/closed

## Complete Example

```yaml
# Complete example with multiple sensors and encryption
esp32_ble:

bthome:
  # Optional encryption for secure communication
  encryption_key: "0123456789ABCDEF0123456789ABCDEF"

  # Adjust advertising intervals
  min_interval: 1s
  max_interval: 1s
  tx_power: 3dBm

  sensors:
    - type: temperature
      id: room_temperature
    - type: humidity
      id: room_humidity
    - type: battery
      id: device_battery
    - type: pressure
      id: barometric_pressure
    - type: illuminance
      id: light_level

  binary_sensors:
    - type: motion
      id: pir_sensor
      advertise_immediately: true  # Broadcast immediately on motion
    - type: door
      id: door_sensor
      advertise_immediately: true  # Broadcast immediately on door state change
    - type: battery_low
      id: low_battery_alert

# Example sensor definitions
sensor:
  - platform: bme280
    temperature:
      name: "Room Temperature"
      id: room_temperature
    humidity:
      name: "Room Humidity"
      id: room_humidity
    pressure:
      name: "Barometric Pressure"
      id: barometric_pressure

  - platform: adc
    pin: GPIO34
    name: "Device Battery"
    id: device_battery
    filters:
      - multiply: 0.048828125  # Convert to percentage

  - platform: bh1750
    name: "Light Level"
    id: light_level

binary_sensor:
  - platform: gpio
    pin: GPIO5
    name: "PIR Sensor"
    id: pir_sensor
    device_class: motion

  - platform: gpio
    pin: GPIO4
    name: "Door Sensor"
    id: door_sensor
    device_class: door

  - platform: template
    name: "Low Battery Alert"
    id: low_battery_alert
    lambda: |-
      return id(device_battery).state < 20.0;
```

## How It Works

The BTHome component periodically broadcasts BLE advertisements containing your sensor data in a standardized format that can be received by compatible devices like Home Assistant. Here's how it operates:

1. **Regular Broadcasts**: The component broadcasts all configured sensor values at the interval specified by `min_interval` and `max_interval`.

1. **Immediate Updates**: When `advertise_immediately` is enabled for a sensor, value changes trigger an instant broadcast instead of waiting for the next scheduled interval. This is ideal for event-driven sensors like motion detectors or door sensors.

1. **Packet Cycling**: If you have many sensors and the data doesn't fit in a single BLE advertisement packet (31-byte limit), the component automatically cycles through multiple packets.

1. **Encryption**: When an `encryption_key` is provided, all sensor data is encrypted using AES-CCM encryption, ensuring secure transmission. Home Assistant and other receivers will need the same encryption key to decrypt the data.

1. **Advertisement Size**: Each BLE advertisement is limited to 31 bytes total. Without encryption, this provides 23 bytes for sensor data. With encryption, only 15 bytes are available due to the encryption overhead (counter and message integrity code).

## Integration with Home Assistant

Home Assistant will automatically discover BTHome devices when the [Bluetooth](https://www.home-assistant.io/integrations/bluetooth/) integration is enabled. The sensor data will appear as entities in Home Assistant without any additional configuration required.

If you've configured encryption, you'll need to provide the same encryption key in Home Assistant when adding the device.

## See Also

- [ESP32 BLE](/components/esp32_ble)
- [ESP32 BLE Beacon](/components/esp32_ble_beacon)
- [ESP32 BLE Tracker](/components/esp32_ble_tracker)
- [Bluetooth Proxy](/components/bluetooth_proxy)
- [BTHome Protocol Specification](https://bthome.io/)
- {{< apiref "bthome/bthome.h" "bthome/bthome.h" >}}
