---
description: "Instructions for setting up Power Management component."
title: "Power Management Component"
params:
  seo:
    description: Instructions for setting up Power Management component.
---

This component enables Power Management and also optionally provides actions for acquiring and releasing Power Management Locks

## Usage

```yaml
# typical
power_management:
  enable_light_sleep: true
```

```yaml
# full
power_management:
  max_frequency: 160MHZ
  min_frequency: 40MHZ
  enable_light_sleep: true
  idle_time_before_sleep: 3
  power_down_flash: true
  power_down_peripherals: true
  esphome_locks: true
  profiling: true
  trace: true
```

### Configuration variables

- **max_frequency** (*Optional*, frequency) Frequency used when CPU lock acquired.  Default is the CPU Frequency defined for the device.  If setting, minimum is 40MHz.  Recommendation is to use default.  If setting for esp32, use: 80 MHz, 160 MHz, or 240 MHz, and use the profiling: True option and see below for how to dump the lock information.
- **min_frequency** (*Optional*, frequency) Frequency used when not holding a CPU lock. Defaults to external clock frequency which is typically 40MHz. If setting, minimum is 10MHz which is the minimum frequency required for generating a 1 MHz REF_TICK default clock.  Recommendation is to use default.  If setting, please use the profiling: True option and see below for how to dump the lock information.
- **enable_light_sleep** (*Optional*, boolean): Stops the system's periodic tick interrupt during idle periods to reduce current consumption and enables automatic Light Sleep.  Defaults to False.  Recommendation is to set to True and test behavior and reduction in power consumption.
- **idle_time_before_sleep** (*Optional*, int): Default is 3, minimum is 2, max is 4294967295.  How long (ticks) should a device be in idle before attempting to go into Light Sleep.
- **power_down_flash** (*Optional*, boolean): Safe power down, do not set to True if device has PSRAM.  Defaults to False.  See discussion below.
- **power_down_peripherals** (*Optional*, boolean): For disabled peripherals, automatically save and restore peripheral states, which allows the peripherals to be powered down.  Defaults to True for esp32-c5, esp32-c6, esp32-c61, esp32-h2, esp32-p4, otherwise False.  See discussion below
- **esphome_locks** (*Optional*, boolean) Configures the following locks: esphome_cpu, esphome_apb, esphome_slp.  These locks can be controlled by actions: power_management.acquire_lock and power_management.release_lock.  Defaults to False.
- **profiling** (*Optional*, boolean): If set to True, will keep track of the amount of time each of the power management locks has been held, use this to analyze which locks are preventing the device from going into a lower power state, and see what time the device spends in each power saving mode. Setting to True does incur some run-time overhead, so should be disabled in production builds.  See below for how to dump the lock information.  Defaults to False.
- **trace** (*Optional*, boolean): If set to True, some GPIOs will be used to signal events such as ticks, frequency switching, entry/exit from idle state. For esp32 devices, Refer to pm_trace.c file for the list of GPIOs. This feature is intended to be used when analyzing/debugging behavior of power management implementation, and should be kept disabled after testing.  See below for how to dump the lock information.  Defaults to False.

> [!NOTE]
> Automatic Light Sleep is enabled by enable_light_sleep: True and occurs when there are no pending tasks.  
In the openthread component, setting the poll_period > 0 dove-tails into this by turning off the radio in between data requests to the parent router allowing the device to go into Light Sleep.

> [!NOTE]
> Do not use Deep Sleep component with enable_light_sleep: True.

## `power_management.acquire_lock` Action

This action acquires a Lock.  This only performs the action when esphome_locks: **True**.
For a given lock_type, a corresponding release_lock is required for each time an acquire_lock action occurs.

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

- **CPU**: Locks the CPU (esphome_cpu) at its max frequency, CPU_FREQ_MAX
- **APB**: Locks the Advanced Peripheral Bus (esphome_apb) to a stable frequency, APB_FREQ_MAX, for esp32, this is 80 MHz.
- **SLP**: Locks out automatic Light Sleep (esphome_slp), NO_LIGHT_SLEEP

## `power_management.release_lock` Action

This action releases a Lock, This only performs the action when esphome_locks: **True**.

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

## Discussion

Power management algorithm can perform Dynamic Frequency Scaling (adjusting the advanced peripheral bus (APB) frequency, and CPU frequency) and automatic Light Sleep mode to run an application at smallest possible power consumption, given the requirements of application components.
Framework components express their requirements by creating, acquiring, and releasing power management locks.  The optional esphome_locks: True allows for this same capability in esphome YAML configrations

Using power_management component comes at the cost of increased interrupt latency and can be upwards of 40 us.

When power_down_flash: True, device will try to power down flash when entering Light Sleep, which costs more time when device wakes up. Can only be enabled if there is no PSRAM configured.
This option will power down flash under a strict but relatively safe condition.  Condition is related to a calculation that device will not attempt wake up while flash is powering down.
This is a valuable option in reducing power consumption, and usage is encouraged with proper testing to ensure that flash is not corrupted.

When power_down_peripherals: True, The device will automatically save/restore register context during sleep/wakeup to make the upper layer unaware of the peripheral powerdown during sleep.  If not enabled (False), no attempt is made to store the register state.  Either setting requires testing since not all peripherals are supported and unsupported peripherals will basically be reset upon wakeup.  It has been observed on a esp32-c6 devkit that setting to False causes a crash within the first minute of operation.

In Light Sleep, peripherals are clock gated, and interrupts (from GPIOs and internal peripherals) will not be generated.  Currently, there is **not** a companion component to provide functionality similar to Deep Sleep, but for Light Sleep.
The difference between Light Sleep and Deep Sleep is that in Light Sleep, the component stops and restarts at the same execution step(s), while in Deep Sleep, the component reboots.

When DFS is enabled, the APB frequency can be changed multiple times within a single RTOS tick. The APB frequency change does not affect the operation of some peripherals, while other peripherals may have issues. For example, Timer Group peripheral timers keeps counting, however, the speed at which they count changes proportionally to the APB frequency.

Currently the following drivers are known to hold a lock and behave well: SPI, I2C, I2C, SDMMC, Ethernet, Wifi, OpenThread, Bluetooth, CAN.
If behavior is not as expected, it is recommended to use esphome_locks: True and integrate acquire_lock and release_lock actions into your YAML.

> [!NOTE]
> It is very important to understand the section: [Dynamic Frequency Scaling and Peripheral Drivers](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/power_management.html#dynamic-frequency-scaling-and-peripheral-drivers)

## Using esp_pm_dump_locks

When using profiling: True, the esp-id function esp_pm_dump_locks can be output to stdout and provide insight into how Power Management is setting and removing locks:

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
