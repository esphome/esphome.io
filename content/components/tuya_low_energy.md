---
description: "Instructions for setting up the Tuya Low Energy component."
title: "Tuya Low Energy"
params:
  seo:
    description: Instructions for setting up the Tuya Low Energy component.
    image: tuya.png
---

The `tuya_low_energy` component creates a serial connection to the Tuya MCU for low energy platforms to use. This component inherits from the [tuya component](/components/tuya) and is specifically designed for Tuya devices that use the low energy protocol, which differs from the standard Tuya MCU protocol.

{{< img src="tuya.png" alt="Image" width="40%" class="align-center" >}}

The `tuya_low_energy` serial component requires a [UART bus](#uart) to be configured. Put the `tuya_low_energy` component in the config and it will list the possible devices for you in the config log.

```yaml
# Register the Tuya Low Energy MCU connection
tuya_low_energy:
```

For configuration variables, datapoint handling, and automation, refer to the [tuya component](/components/tuya) documentation, as `tuya_low_energy` supports the same options including `time_id`, `status_pin`, `ignore_mcu_update_on_datapoints`, and `on_datapoint_update`.

## See Also

- {{< docref "/components/tuya" >}}
- {{< docref "/components/switch/tuya" >}}
- {{< docref "/components/binary_sensor/tuya" >}}
- {{< docref "/components/sensor/tuya" >}}
- {{< docref "/components/text_sensor/tuya" >}}
- {{< docref "/components/number/tuya" >}}
- {{< apiref "tuya_low_energy/tuya_low_energy.h" "tuya_low_energy/tuya_low_energy.h" >}}