---
description: "Configuration for the STM32 platform for ESPHome."
title: "STM32 Platform"
params:
  seo:
    description: Configuration for the STM32 platform for ESPHome.
---

This component contains platform-specific options for the STM32 platform.

> [!NOTE]
> Support for all aspects of ESPHome on the STM32 is still in development.

```yaml
# Example configuration entry
stm32:
  board: nucleo_l476rg
```

## Configuration variables

- **board** (*Required*, string): The board type. It needs to be supported by both `platformio` and `zephyr`. To list all STM32 boards supported by `platformio` run command:
  ```
  pio boards | grep -i stm32
  ```

  STM32 boards supported by `zephyr` can be found [here](https://docs.zephyrproject.org/latest/boards/index.html#vendor=st&arch=arm).

- platform (Optional, string, defaults to 'ststm32'): It allows to override platformio's `platform` option.

## GPIO Pin Numbering

There are two ways to reference GPIO pins:

1. By pin name, e.g., `PA1` or `PB2`.
1. By pin number, e.g., `1` or `18`.

### How to start

Try minimum LED blinking config for the board:

[nucleo_l476rg](https://www.st.com/en/evaluation-tools/nucleo-l476rg.html)

```yaml
stm32:
  board: nucleo_l476rg

esphome:
  name: nucleo-l476rg

logger:
  level: DEBUG

output:
  - platform: gpio
    pin: PA5
    id: user_led

interval:
  - interval: 1s
    then:
      - output.turn_on: user_led
      - delay: 0.5s
      - output.turn_off: user_led

```
## Flashing
You can flash your board using ST-Link programmer. Simply connect it via USB and run:
```
esphome run your_config.yaml
```


## See Also

- {{< docref "esphome/" >}}
- [Zephyr - Board Porting Guide](https://docs.zephyrproject.org/latest/hardware/porting/board_porting.html)

