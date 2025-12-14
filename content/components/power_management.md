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

> [!NOTE]
> Automatic Light-sleep is enabled by tickless_idle: true and occurs when there are no pending tasks.  
In the openthread component, setting the poll_period > 0 dove-tails into this by turning off the radio in between data requests to the parent router.
> [!NOTE]
> Refenced the closed PR [Initial support for power management #4916](https://github.com/esphome/esphome/pull/4916) during the development (@silverchris)

> [!NOTE]
> Do not use Deep Sleep component with tickless_idle: true.

## Usage
```yaml
power_management:
  id: pm_id
  timer_lock_duration: 10sec
  tickless_idle: false
  power_down_flash: true
  power_down_peripherals: true
```

### Configuration variables

- **timer_lock_duration** (*Optional*, [Time](/guides/configuration-types#config-time)): Time that device is locked initially after boot.
- **tickless_idle** (*Optional*, boolean): Stops the system's periodic tick interrupt during idle periods to reduce current consumption.
- **power_down_flash** (*Optional*, boolean): Safe power down, do not set to true if device has PSRAM.
- **power_down_peripherals** (*Optional*, boolean): For disabled peripherals, automatically save and restore peripheral states, which allows the peripherals to be powered down.
- **profiling** (*Optional*, boolean): sets the sdkconfig: CONFIG_PM_PROFILING.
- **trace** (*Optional*, boolean): sets the sdkconfig: CONFIG_PM_TRACE.

> [!NOTE]
> Use of trace configuration variable requires detailed understanding of "esp-idf/components/esp_pm/pm_trace.c" and which GPIO pins are consumed for tracing.

## `power_management.acquire_lock` Action

This action acquires a CPU Lock

```yaml
on_...:
  then:
  # Long form aquires a SLP Lock
    - power_management.acquire_lock:
        lock_type: SLP
  # Short form aquires a CPU lock
    - power_management.acquire_lock:
  # Short form aquires a APB lock
    - power_management.acquire_lock: APB
  # Long form aquires a TMR Lock
    - power_management.acquire_lock:
        lock_type: TMR
        #optional, will use last setting (including what was set by CV at power_management component)
        timer_lock_duration: 10sec
```

#### Configuration variables

- **lock_type** (*Optional*): The lock type, valid values are TMR, CPU, APB, SLP, defaults to CPU
- **timer_lock_duration** (*Optional*, [Time](/guides/configuration-types#config-time)): Time that device is locked initially after boot.  Only used when lock_type: TMR

#### Lock Types

- **TMR**: A CPU_FREQ_MAX lock that is set for the **timer_lock_duration** and then released
- **CPU**: Locks the CPU at its max frequency, CPU_FREQ_MAX
- **APB**: Locks the Advanced Peripheral Bus to a stable frequency, APB_FREQ_MAX
- **SLP**: Locks out automatic light sleep, NO_LIGHT_SLEEP

## `power_management.release_lock` Action

This action releases a CPU Lock

```yaml
on_...:
  then:
  # Long form aquires a SLP Lock
    - power_management.release_lock:
        lock_type: SLP
  # Short form aquires a CPU lock
    - power_management.release_lock:
  # Short form aquires a APB lock
    - power_management.release_lock: APB
```

#### Configuration variables

- **lock_type** (*Optional*): The lock type, valid values are CPU, APB, SLP, defaults to CPU

## Example of using Actions

## Using esp_pm_dump_locks
The esp-id function esp_pm_dump_locks can be output to stdout and provide insight into how Power Management is setting and removing locks:

```
interval:
  - interval: 30s
    then:
      - lambda: |-
          esp_pm_dump_locks(stdout);
```

This can also be done within an existing sensor to ensure that dump is occuring at same time that sensor value is published.

```
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