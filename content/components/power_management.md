---
description: "Instructions for setting up Power Management component."
title: "Power Management Component"
params:
  seo:
    description: Instructions for setting up Power Management component.
---

This component enables Power Management and also provides methods for acquiring and releasing Power Management Locks

[esp-idf Power Management](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/power_management.html)
Power management algorithm included in ESP-IDF can adjust the advanced peripheral bus (APB) frequency, CPU frequency, and put the chip into Light-sleep
mode to run an application at smallest possible power consumption, given the requirements of application components.

> [!NOTE]
> Automatic Light-sleep enabled by tickless_idle: true requires a timer technique to wake up device.  This is available in openthread when poll_period > 0 
and currently the Power Management componentis meant to be used with esp32-h2 and esp32-c6 devices configured for openthread with a poll_period defined.

> [!NOTE]
> Refenced the closed PR [Initial support for power management #4916](https://github.com/esphome/esphome/pull/4916) during the development (@silverchris)

> [!NOTE]
> Do not use Deep Sleep component with tickless_idle: true.

## Usage

Example usage including a sensor

```yaml
power_management:
  id: pm_id
  initial_lock_duration: 61sec
  tickless_idle: false
  power_down_flash: true
  power_down_peripherals: true
```

### Configuration variables

- **lock_duration** (*Optional*, [Time](/guides/configuration-types#config-time)): Time that device is locked initially after boot.
- **tickless_idle** (*Optional*, boolean): Stops the system's periodic tick interrupt during idle periods to reduce current consumption.
- **power_down_flash** (*Optional*, boolean): Safe power down, do not set to true if device has PSRAM.
- **power_down_peripherals** (*Optional*, boolean): For disabled peripherals, automatically save and restore peripheral states, which allows the peripherals to be powered down.
- **profiling** (*Optional*, boolean): sets the sdkconfig: CONFIG_PM_PROFILING.
- **trace** (*Optional*, boolean): sets the sdkconfig: CONFIG_PM_TRACE.

## `power_management.acquire_lock` Action

This action acquires a CPU Lock

## `power_management.release_lock` Action

This action releases a CPU Lock

## Example of using Actions

```yaml
button:
  - platform: template
    name: "OTA Http Request Update"
    on_press:
      then:
        - logger.log: "Turn On Lock"
        - power_management.acquire_lock:
        - logger.log: "Begin OTA Flash"
        - ota.http_request.flash:
            md5_url: http://192.168.1.2:8000/firmware.md5
            url: http://192.168.1.2:8000/firmware.ota.bin
        # This only happens on a failed ota
        - logger.log: "Turn Off Lock"
        - power_management.release_lock:
```
