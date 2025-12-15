---
description: "Instructions for setting up Power Management component."
title: "Power Management Component"
params:
  seo:
    description: Instructions for setting up Power Management component.
---

This component enables Power Management and also provides methods for acquiring and releasing Power Management Locks

[esp-idf Power Management](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/power_management.html)
Power management algorithm included in ESP-IDF can adjust the advanced peripheral bus (APB) frequency, CPU frequency, and automatically put the chip into Light-sleep
mode to run an application at smallest possible power consumption, given the requirements of application components.

It is very important to understand the section: [Dynamic Frequency Scaling and Peripheral Drivers](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/power_management.html#dynamic-frequency-scaling-and-peripheral-drivers)

## Usage

```yaml
# typical
power_management:
  id: pm_id
  tickless_idle: true
  power_down_flash: true
  power_down_peripherals: true
```

```yaml
# full
power_management:
  id: pm_id
  max_frequency: 96MHZ
  min_frequency: 32MHZ
  tickless_idle: true
  power_down_flash: true
  power_down_peripherals: true
  profiling: true
  trace: true
```

### Configuration variables

- **max_frequency** (*Optional*, frequency) Frequency used when CPU lock acquired.  Defaults to CONFIG_ESP_DEFAULT_CPU_FREQ_MHZ.
- **min_frequency** (*Optional*, frequency) Frequency used when not holding a CPU lock. Defaults to (esp_clk_xtal_freq() / MHZ).
- **tickless_idle** (*Optional*, boolean): Stops the system's periodic tick interrupt during idle periods to reduce current consumption and enables automatic light-sleep.  Defaults to False.
- **power_down_flash** (*Optional*, boolean): Safe power down, do not set to true if device has PSRAM.  Defaults to False.
- **power_down_peripherals** (*Optional*, boolean): For disabled peripherals, automatically save and restore peripheral states, which allows the peripherals to be powered down.  Defaults to False.
- **profiling** (*Optional*, boolean): sets the sdkconfig: CONFIG_PM_PROFILING.  Defaults to False.
- **trace** (*Optional*, boolean): sets the sdkconfig: CONFIG_PM_TRACE.  Defaults to False.

> [!NOTE]
> Use of trace configuration variable requires detailed understanding of "esp-idf/components/esp_pm/pm_trace.c" and which GPIO pins are consumed for tracing.

> [!NOTE]
> Automatic Light-sleep is enabled by tickless_idle: true and occurs when there are no pending tasks.  
In the openthread component, setting the poll_period > 0 dove-tails into this by turning off the radio in between data requests to the parent router.

> [!NOTE]
> Do not use Deep Sleep component with tickless_idle: true.

## `power_management.acquire_lock` Action

This action acquires a Lock

```yaml
on_...:
  then:
  # Long form aquires a CPU Lock
    - power_management.acquire_lock:
        lock_type: CPU
  # Short form aquires a SLP lock
    - power_management.acquire_lock:
  # Short form aquires a APB lock
    - power_management.acquire_lock: APB
```

### Configuration variables

- **lock_type** (*Optional*): The lock type, valid values are TMR, CPU, APB, SLP, defaults to SLP

### Lock Types

- **CPU**: Locks the CPU at its max frequency, CPU_FREQ_MAX
- **APB**: Locks the Advanced Peripheral Bus to a stable frequency, APB_FREQ_MAX
- **SLP**: Locks out automatic light sleep, NO_LIGHT_SLEEP

## `power_management.release_lock` Action

This action releases a Lock

```yaml
on_...:
  then:
  # Long form releases a CPU Lock
    - power_management.release_lock:
        lock_type: CPU
  # Short form releases a SLP lock
    - power_management.release_lock:
  # Short form releases a APB lock
    - power_management.release_lock: APB
```

### Configuration variables

- **lock_type** (*Optional*): The lock type, valid values are CPU, APB, SLP, defaults to SLP

## Using esp_pm_dump_locks

The esp-id function esp_pm_dump_locks can be output to stdout and provide insight into how Power Management is setting and removing locks:

```yaml
interval:
  - interval: 30s
    then:
      - lambda: |-
          esp_pm_dump_locks(stdout);
```

This can also be done within an existing sensor to ensure that dump is occuring at same time that sensor value is published.

```yaml
sensor:
  - platform: uptime
    name: "Open Thread Connect"
    id: open_thread_connect_sensor_id
    type: seconds
    update_interval: 1min
    # profiling sleep to stdout - don't do permanently
    on_value:
      then:
      - lambda: |-
          esp_pm_dump_locks(stdout);
```

> [!NOTE]
> Refenced the closed PR [Initial support for power management #4916](https://github.com/esphome/esphome/pull/4916) during the development (@silverchris)
