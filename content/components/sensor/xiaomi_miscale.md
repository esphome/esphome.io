---
description: "Instructions for setting up Xiaomi Miscale bluetooth-based sensors in ESPHome."
title: "Xiaomi Miscale Sensors"
params:
  seo:
    description: Instructions for setting up Xiaomi Miscale bluetooth-based sensors in ESPHome.
    image: xiaomi_miscale.jpg
---

The `xiaomi_miscale` sensor platform lets you track the output of Xiaomi Bluetooth Low Energy devices using the {{< docref "/components/esp32_ble_tracker" >}}. This component will track, for example, the weight of the device every time the sensor sends out a BLE broadcast. Contrary to other implementations, `xiaomi_miscale` listens passively to advertisement packets and does not pair with the device. Hence ESPHome has no impact on battery life.

To get the body scores using your weight, height, age and gender see the [custom_components](https://github.com/dckiller51/bodymiscale)

## Supported Devices

### XMTZC01HM, XMTZC04HM, XMTZC02HM, XMTZC05HM

Miscale (left) measures weight only. Miscale2 (right) measures weight and impedance.

{{< img src="xiaomi_miscale.jpg" alt="Image" width="60.0%" class="align-center" >}}

```yaml
sensor:
  - platform: xiaomi_miscale
    mac_address: XX:XX:XX:XX:XX:XX
    weight:
      name: "Xiaomi Mi Scale Weight"
    impedance:
      name: "Xiaomi Mi Scale Impedance"
```

### MJTZC01YM

Xiaomi Body Composition Scale S400 can also measure impedance with 50kHz low frequency and heart rate. It must be first added in the Mijia (Xiaomi Home) app to start sending out advertisement packets containing metrics data, and to display the body fat percentage and heart rate on the scale's screen. It also supports multi-profile if configured in the app.

Since the messages are encrypted, you must provide a bindkey to be able to decrypt them, please see [Other encrypted devices](/components/sensor/xiaomi_ble#other-encrypted-devices).

{{< img src="xiaomi_miscale_s400.jpg" alt="Xiaomi MiScale S400" width="30.0%" class="align-center" >}}

```yaml
sensor:
  - platform: xiaomi_miscale
    mac_address: XX:XX:XX:XX:XX:XX
    bindkey: 0728974d657a4b60964c1b1677f35f7c
    weight:
      name: "Xiaomi Mi Scale Weight"
      accuracy_decimals: 1
      # for pounds
      # filters:
      #   - multiply: 2.20462
      # unit_of_measurement: "lb"
    heart_rate:
      name: "Xiaomi Mi Scale Heart Rate"
    impedance:
      name: "Xiaomi Mi Scale Impedance High"
    impedance_low:
      name: "Xiaomi Mi Scale Impedance Low"
    timestamp:
      name: "Xiaomi Mi Scale Timestamp"
    profile_id:
      name: "Xiaomi Mi Scale Profile ID"
    allowed_profile_ids:
      - 1
```

## Configuration variables

- **mac_address** (**Required**, MAC Address): The MAC address of the scale.
- **bindkey** (*Optional*, string, 32 characters, case insensitive): The key to decrypt the BLE advertisements messages. **Only required for S400**.
- **weight** (*Optional*): The information for the weight sensor.

  - All options from [Sensor](/components/sensor).

- **impedance** (*Optional*): The information for the impedance sensor. **Only available on MiScale2**

  - All options from [Sensor](/components/sensor).

- **impedance_low** (*Optional*): The information for the low frequency impedance sensor. **Only available on S400**

  - All options from :ref:`Sensor <config-sensor>`.

- **clear_impedance** (*Optional*): Clear the impedance information if a weight reading without impedance is received. Defaults to `false`. **Only available on MiScale2**

  Useful in the example below if a person steps onto the scale without waiting for the complete measurement. Without setting the flag the impedance reading of the measurement before will be used for the currently measured person.

- **heart_rate** (*Optional*): The information for the heart rate sensor. **Only available on S400**

  - All options from :ref:`Sensor <config-sensor>`.

- **timestamp** (*Optional*): The information for the timestamp sensor, not recommended to use as the built-in RTC drifts quickly without constant syncing with the app. **Only available on S400**

  - All options from :ref:`Sensor <config-sensor>`.

- **profile_id** (*Optional*): The information for the profile ID sensor. **Only available on S400**

  - All options from :ref:`Sensor <config-sensor>`.

- **allowed_profile_ids** (*Optional*, list of uint8): A list of profile ID to be allowed to publish metric states. Any ID (``any``) will be allowed if this parameter is omitted. **Only available on S400**

### Configuration example with multiple users

You have to replace the numbers in the lambdas to determine your weight which is between X weight and X weight.

```yaml
sensor:
  - platform: xiaomi_miscale
    mac_address: XX:XX:XX:XX:XX:XX
    weight:
      name: "Xiaomi Mi Scale Weight"
      id: weight_miscale
      on_value:
        then:
          - lambda: |-
              if (id(weight_miscale).state >= 69 && id(weight_miscale).state <= 74.49) {
                return id(weight_user1).publish_state(x);}
              else if (id(weight_miscale).state >= 74.50 && id(weight_miscale).state <= 83) {
                return id(weight_user2).publish_state(x);}

    impedance:
      name: "Xiaomi Mi Scale Impedance"
      id: impedance_miscale
      on_value:
        then:
          - lambda: |-
              if (id(weight_miscale).state >= 69 && id(weight_miscale).state <= 74.49) {
                return id(impedance_user1).publish_state(x);}
              else if (id(weight_miscale).state >= 74.50 && id(weight_miscale).state <= 83) {
                return id(impedance_user2).publish_state(x);}

  - platform: template
    name: Weight Aurélien
    id: weight_user1
    unit_of_measurement: 'kg'
    icon: mdi:weight-kilogram
    accuracy_decimals: 2
  - platform: template
    name: Impedance Aurélien
    id: impedance_user1
    unit_of_measurement: 'Ω'
    icon: mdi:omega
    accuracy_decimals: 0
  - platform: template
    name: Weight Siham
    id: weight_user2
    unit_of_measurement: 'kg'
    icon: mdi:weight-kilogram
    accuracy_decimals: 2
  - platform: template
    name: Impedance Siham
    id: impedance_user2
    unit_of_measurement: 'Ω'
    icon: mdi:omega
    accuracy_decimals: 0
```

For S400, if you have configured multiple profiles in the Mijia (Xiaomi Home) app:

```yaml
sensor:
  - platform: xiaomi_miscale
    mac_address: XX:XX:XX:XX:XX:XX
    bindkey: 0728974d657a4b60964c1b1677f35f7c
    weight:
      name: "Xiaomi Mi Scale Weight"
      id: weight_miscale
    impedance:
      name: "Xiaomi Mi Scale Impedance High"
      id: impedance_miscale
    impedance_low:
      name: "Xiaomi Mi Scale Impedance Low"
      id: impedance_low_miscale
    heart_rate:
      name: "Xiaomi Mi Scale Heart Rate"
      id: heart_rate_miscale
    profile_id:
      name: "Xiaomi Mi Scale Impedance"
      on_value:
        then:
          - lambda: |-
              float weight = id(weight_miscale).state;
              float impedance = id(impedance_miscale).state;
              float impedance_low = id(impedance_low_miscale).state;
              uint8_t heart_rate = id(heart_rate_miscale).state;

              switch (int(x)) {
                case 1:
                  if (weight)
                    id(weight_user1).publish_state(weight);
                  if (impedance)
                    id(impedance_user1).publish_state(impedance);
                  if (impedance_low)
                    id(impedance_low_user1).publish_state(impedance_low);
                  if (heart_rate)
                    id(heart_rate_user1).publish_state(heart_rate);
                  return;
                case 2:
                  if (weight)
                    id(weight_user2).publish_state(weight);
                  if (impedance)
                    id(impedance_user2).publish_state(impedance);
                  if (impedance_low)
                    id(impedance_low_user2).publish_state(impedance_low);
                  if (heart_rate)
                    id(heart_rate_user2).publish_state(heart_rate);
                  return;
              }
```

## See Also

- {{< docref "/components/esp32_ble_tracker" >}}
- {{< docref "/components/sensor" >}}
- [bodymiscale score integration for Home Assistant (bodymiscale custom component)](https://github.com/dckiller51/bodymiscale)
- [bodymiscale Lovelace Card](https://github.com/dckiller51/lovelace-body-miscale-card)
