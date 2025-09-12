---
title: "DFRobot C4001 Radar Sensor"
description: "Support for the DFRobot C4001 mmWave radar sensor in ESPHome."
---

## Example configuration

```yaml
uart:
  id: uart_bus
  tx_pin: GPIO1
  rx_pin: GPIO3
  baud_rate: 9600

external_components:
  - source:
      type: git
      url: https://github.com/96liuzhixin/esphome
      ref: dev
    components:
      dfrobot_c4001

dfrobot_c4001:
  id: my_c4001
  uart_id: uart_bus

select:
  - platform: dfrobot_c4001
    operating_mode:
      name: "Mode Select"

number:
  - platform: dfrobot_c4001
    max_range:
      name: "Max detection distance"
    trig_range:
      name: "Trigger range"
    keep_sensitivity:
      name: "Keep sensitivity"
    trig_sensitivity:
      name: "Trigger sensitivity"
    confirm_delay:
      name: "Confirm delay"
    disappear_delay:
      name: "Disappear delay"
    threshold_factor:
      name: "Threshold factor"
    min_range:
      name: "Min detection distance"

switch:
  - platform: dfrobot_c4001
    motion_switch:
      name: "Motion Switch"

sensor:
  - platform: dfrobot_c4001
    c4001_id: my_c4001
    speed:
      name: "Speed"
      id: c4001_speed
    distance:
      name: "Distance"
      id: c4001_distance

binary_sensor:
  - platform: dfrobot_c4001
    exist_state:
      name: "Presence"
