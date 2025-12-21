---
description: "Instructions for setting up DFRobot C4001 mmWave Radar"
title: "DFRobot C4001 mmWave Radar"
params:
  seo:
    description: Instructions for setting up DFRobot C4001 mmWave Radar
    image: dfrobot_sen0609.jpg
---

The DFRobot C4001 ([SEN0609](https://wiki.dfrobot.com/SKU_SEN0609_C4001_mmWave_Presence_Sensor_25m)
or [SEN0610](https://wiki.dfrobot.com/SKU_SEN0610_Gravity_C4001_mmWave_Presence_Sensor_12m_I2C_UART))
is a millimeter-wave presence detector. This presence sensor has the advantage of being able to
detect both static and moving objects. It also has a relatively strong anti-interference ability,
making it less susceptible to factors such as temperature changes, variations in ambient light, and
environmental noise. Whether a person is sitting, sleeping, or in motion, the sensor can quickly
detect their presence.

{{< img src="dfrobot_sen0609_full.jpg" alt="Image" caption="DFRobot C4001 (SEN0609) mmWave Radar" width="75%" class="align-center" >}}

There are two variants:

+ SEN0609 has a 100° horizontal and 40° vertical field of view, 16 meter presence detection range
  and 25 meter motion detection range.
+ SEN0610 has a 100° horizontal and 80° vertical field of view, 8 meter presence detection range
  and 12 meter motion detection range.

> [!NOTE]
> Some settings have different ranges depending on the variant used. This component treats both
> variants the same. It is your responsibility to make sure your configuration sets these values
> appropriately.

The sensor can operate in one of two modes, `PRESENCE` and `SPEED_AND_DISTANCE`. In `PRESENCE` mode
the sensor provides a singular occupancy output. Once presence is detected presence will stay on as
long as presence is detected. Once presence is no longer detected presence will turn off only after
a hold time has elapsed. In `SPEED_AND_DISTANCE` mode the occupancy binary sensor indicates if a
target is being tracked or not. Each time the sensor indicates presence it also outputs target
distance, speed and energy. In `SPEED_AND_DISTANCE` mode all of these parameters update frequently.
There are only two settings for this mode, `micro_motion_enable switch` and `threshold_factor number`.

```yaml
    # Sample configuration entry for SEN0609
    dfrobot_c4001:
      id: mmwave_sensor
      uart_id: mmwave_uart
      model: SEN0609
      mode: PRESENCE

    binary_sensor:
      - platform: dfrobot_c4001
        config_changed:
          name: Config Changed
        occupancy:
          id: occupancy
          name: Occupancy
          
    button:
      - platform: dfrobot_c4001
        config_save:
          name: Config Save
          entity_category: CONFIG

    number:
      - platform: dfrobot_c4001
        dfrobot_c4001_id: mmwave_sensor
        max_range:
          name: Range Max
        min_range:
          name: Range Min
        trigger_range:
          name: Range Trigger
        hold_sensitivity:
          name: Sensitivity Hold
        trigger_sensitivity:
          name: Sensitivity Trigger
        on_latency:
          name: Latency On
        off_latency:
          name: Latency Off
        inhibit_time:
          name: Inhibit Time

    switch:
      - platform: dfrobot_c4001
        dfrobot_c4001_id: mmwave_sensor
        out_led_enable:
          name: Enable OUT LED
        run_led_enable:
          name: Enable RUN LED
        micro_motion_enable:
          name: Micro Motion Enable
```

The C4001 sensor maintains settings in flash. When powered on these settings are loaded from flash and
made operational. To change the configuration of the sensor dial in the `number` settings you need and
hit the `config_save` button. Once a setting is changed but not saved to flash the `config_changed`
update sensor will change to `Update Available`.

{{< anchor "dfrobot_c4001-component" >}}

## Hub Component

The hub component `dfrobot_c4001:` entry is required to define the `model` and `mode` of the sensor.
A `uart:` entry is also required in with both the TX and RX pins defined and the baud rate must be
set to `9600`.

Multiple instances of this component may be defined if multiple [UART bus](/components/uart)
components are available:

```yaml
dfrobot_c4001: 
  - id: mmwave_1
    uart_id: uart_1
    mode: PRESENCE
    model: SEN0609
  - id: mmwave_2
    uart_id: uart_2
    mode: PRESENCE
    model: SEN0610
```

### Configuration variables

+ **id** (*Optional*, [Id](/guides/configuration-types#config-id)): Manually specify the ID used for code generation. Necessary
  if you want to use multiple DFRobot C4001 sensors.

+ **uart_id** (*Optional*, [Id](/guides/configuration-types#config-id)): Manually specify the ID of the
  [UART bus](/components/uart) if you want to use multiple DFRobot C4001 sensors.

+ **mode** (*Required*, enum): This sets the operation mode of the sensor. Options are `PRESENCE`
  and `SPEED_AND_DISTANCE`.

+ **model** (*Required*, enum): This sets the model of the connected sensor. Options are `SEN0609`
  and `SEN0610`.

{{< anchor "dfrobot_c4001-binary_sensor" >}}

## Binary Sensor

[Binary Sensor Components](/components/binary_sensor#config-binary_sensor) provide read only binary state information such `on`/`off`
or `true`/`false`.

``` yaml
binary_sensor:
  - platform: dfrobot_c4001
    dfrobot_c4001_id: mmwave_sensor
    config_changed:
      name: Config Changed
    occupancy:
      id: occupancy
      name: Occupancy
```

### Configuration variables

+ **dfrobot_c4001_id** (*Optional*, [Id](/guides/configuration-types#config-id)): The ID of the DFRobot mmWave hub component.
  Required when multiple instances of the `dfrobot_c4001` component are defined.

+ **config_changed** (*Optional*): When `true` the current sensor configuration has been changed but
  not saved to the sensor.
  
  + All Options from [Binary Sensor](/components/binary_sensor#config-binary_sensor).

+ **occupancy** (*Optional*): In `PRESENCE` mode this indicates presence. In `SPEED_AND_DISTANCE`
  mode this indicates a target is being tracked.
  
  + All Options from [Binary Sensor](/components/binary_sensor#config-binary_sensor).

{{< anchor "dfrobot_c4001-button" >}}

## Button

[Button Components](/components/button#config-button) provide a execute operation.

``` yaml
button:
  - platform: dfrobot_c4001
    dfrobot_c4001_id: mmwave_sensor
    restart:
      name: C4001 Restart
    config_save:
      name: Config Save
    factory_reset:
      name: Factory Reset
```

### Configuration variables

+ **dfrobot_c4001_id** (*Optional*, [Id](/guides/configuration-types#config-id)): The ID of the DFRobot mmWave hub component.
  Required when multiple instances of the `dfrobot_c4001` component are defined.

+ **restart** (*Optional*): When this button is clicked, the C4001 module will be restarted with the
  settings in flash applied. Please note that any unsaved changes will be discarded.
  
  + All Options from [Button](/components/button#config-button).

+ **config_save** (*Optional*): Clicking this button sends the new settings to the C4001 module, saves
  them to flash, and restarts the module with the updated configuration.
  
  + All Options from [Button](/components/button#config-button).

+ **factory_reset** (*Optional*): This button will restore the C4001 module to its factory settings.
  
  + All Options from [Button](/components/button#config-button).

> [!WARNING]
> Each change to the configuration of the mmWave radar triggers a write to its internal flash.
> Write cycles to this memory are limited, so avoid the practice of changing settings frequently.

{{< anchor "dfrobot_c4001-number" >}}

## Number

[Number Components](/components/number#config-number) provide read only numeric information such `distance`.

``` yaml
number:
  - platform: dfrobot_c4001
    dfrobot_c4001_id: mmwave_sensor
    max_range:
      name: Range Max
    min_range:
      name: Range Min
    trigger_range:
      name: Range Trigger
    hold_sensitivity:
      name: Sensitivity Hold
    trigger_sensitivity:
      name: Sensitivity Trigger
    on_latency:
      name: Latency On
    off_latency:
      name: Latency Off
    inhibit_time:
      name: Inhibit Time
```

### Configuration variables

+ **dfrobot_c4001_id** (*Optional*, [Id](/guides/configuration-types#config-id)): The ID of the DFRobot mmWave hub component.
  Required when multiple instances of the `dfrobot_c4001` component are defined.

+ **min_range** (*Optional*, float): This is the minimum detection range. This number has a range of
  0.6 to 25.0 m for the `SEN0609` and a range of 0.6 to 12.0 m for the `SEN0610`. The manual
  recommends not changing this value. The `config_save` button must be clicked to save the sensor
  configuration to flash and make operational. Available in all modes.
  
  + All Options from [Number](/components/number#config-number).

+ **max_range** (*Optional*, float): This is the maximum detection range. This number has a range of
  0.6 to
  25.0 m for the `SEN0609` and a range of 0.6 to 12.0 m for the `SEN0610`. The `config_save` button
  must be clicked to save the sensor configuration to flash and make operational. Available in all
  modes.
  
  + All Options from [Number](/components/number#config-number).

+ **trigger_range** (*Optional*, float): Sets the maximum range at which occupancy can switch to
  present. The range between max detection range and trigger detection range will NOT cause occupancy
  to switch to present. This number has a range of 0.6 to 25.0 m for the `SEN0609` and a range of
  0.6 to 12.0 m for the `SEN0610`. The `config_save` button must be clicked to save the sensor
  configuration to flash and make operational. Available only in `PRESENCE` mode.
  
  + All Options from [Number](/components/number#config-number).

+ **hold_sensitivity** (*Optional*, float): The number represents the ease in which the sensor switches
  to the present state when someone enters the sensing range of the sensor. Default is 7 (no units)
  with a range of 0 to 9, higher is more sensitive. The `config_save` button must be clicked to save
  the sensor configuration to flash and make operational. Available only in `PRESENCE` mode.
  
  + All Options from [Number](/components/number#config-number).

+ **trigger_sensitivity** (*Optional*, float): This number represents ease of continued presence
  detection after the sensor switched to the present state. Default is 5 (no units) with a range of
  0 to 9, higher is more sensitive. The `config_save` button must be clicked to save the sensor
  configuration to flash and make operational. Available only in `PRESENCE` mode.
  
  + All Options from [Number](/components/number#config-number).
  
+ **on_latency** (*Optional*, float): This time value is how long presence is detected before switching
  to the present state. Default is 0.050 seconds with a range of 0.0 to 100.0 seconds. The
  `config_save` button must be clicked to save the sensor configuration to flash and make operational.
  Available only in `PRESENCE` mode.
  
  + All Options from [Number](/components/number#config-number).

+ **off_latency** (*Optional*, float): This time value is how long the after the sensor no longer
  detects presence before switching to the not present state. Default is 15 (seconds) with a range of
  0.0 to 1500.0. The `config_save` button must be clicked to save the sensor configuration to flash
  and make operational. Available only in `PRESENCE` mode.
  
  + All Options from [Number](/components/number#config-number).

+ **inhibit_time** (*Optional*, float): The dead-time after switching to the not present state before
  presence can be detected again. Default is 1 seconds with a range of 0.1 to 255.0 seconds. The
  `config_save` button must be clicked to save the sensor configuration to flash and make operational.
  Available only in `PRESENCE` mode.
  
  + All Options from [Number](/components/number#config-number).

+ **threshold_factor** (*Optional*): The larger the number the larger the object and more motion is
  required to trigger the sensor to switch to target tracked state. Default is 5 (no units) with a
  range of 0.0 to 25.0. The `config_save` button must be clicked to save the sensor configuration to
  flash and make operational. Available only in `SPEED_AND_DISTANCE` mode.
  
  + All Options from [Number](/components/number#config-number).

When `trigger_range` (only in `PRESENCE` mode) is defined you must define `min_range` and `max_range`.
Both `min_range` and `max_range` must always be defined together.

The component will enforce the following relationships:

+ `min_range` must be less than or equal to `max_range`.
+ `min_range` must be less than or equal to `trigger_range`.
+ `trigger_range` must be greater than or equal to `min_range`.
+ `trigger_range` must be less than or equal to `max_range`.

{{< anchor "dfrobot_c4001-sensor" >}}

## Sensor

[Sensor Components](/components/sensor#config-sensor) provide read only numeric information such `distance`.

``` yaml
sensor:
  - platform: dfrobot_c4001
    dfrobot_c4001_id: mmwave_sensor
    target_distance:
      name: Target Distance
    target_speed:
      name: Target Speed
    target_energy:
      name: Target Energy
```

### Configuration variables

+ **dfrobot_c4001_id** (*Optional*, [Id](/guides/configuration-types#config-id)): The ID of the DFRobot mmWave hub component.
  Required when multiple instances of the `dfrobot_c4001` component are defined.

+ **target_distance** (*Optional*): When **occupancy** binary sensor is `true` this sensor indicates
  distance to target in meters (m). When **occupancy** binary sensor is `false` this sensor switches
  to 0.0 indicating invalid data. Available only in `SPEED_AND_DISTANCE` mode.
  
  + All Options from [Sensor](/components/sensor#config-sensor).

+ **target_speed** (*Optional*): When **occupancy** binary sensor is `true` this sensor indicates
  target speed in meters per second (m/s). When **occupancy** binary sensor is `false` this sensor
  switches to 0.0 indicating invalid data. Available only in `SPEED_AND_DISTANCE` mode.
  
  + All Options from [Sensor](/components/sensor#config-sensor).

+ **target_energy** (*Optional*): When **occupancy** binary sensor is `true` this sensor indicates
  target energy in no units. When **occupancy** binary sensor is `false` this sensor switches to 0.0
  indicating invalid data. Available only in `SPEED_AND_DISTANCE` mode.
  
  + All Options from [Sensor](/components/sensor#config-sensor).

{{< anchor "dfrobot_c4001-switch" >}}

## Switch

[Switch Components](/components/switch#config-switch) are used to enable/disable various module features/functions.

``` yaml
switch:
  - platform: dfrobot_c4001
    dfrobot_c4001_id: mmwave_sensor
    out_led_enable:
      name: Enable OUT LED
    run_led_enable:
      name: Enable RUN LED
    micro_motion_enable:
      name: Micro Motion Enable
```

### Configuration variables

+ **dfrobot_c4001_id** (*Optional*, [Id](/guides/configuration-types#config-id)): The ID of the DFRobot mmWave hub component.
  Required when multiple instances of the `dfrobot_c4001` component are defined.

+ **out_led_enable** (*Optional*): The `OUT` LED turns on when presence is detected. You can
  disable this feature with this switch. Warning: when the `OUT` LED is disabled on the SEN0609 the
  `OUT` signal is also disabled. Presence detection with a GPIO will no longer work. The `occupancy`
  binary_sensor still works because its state is read from the UART interface. The `config_save`
  button must be clicked to save the sensor configuration to flash and make operational.

  + All Options from [Switch](/components/switch#config-switch).

+ **run_led_enable** (*Optional*): The `RUN` LED will flash while the sensor is running. You can turn if
  off with this switch. The `config_save` button must be clicked to save the sensor configuration to flash and
  make operational.

  + All Options from [Switch](/components/switch#config-switch).
  
+ **micro_motion_enable** (*Optional*): Turns on/off micro motion mode. Available only in
  `SPEED_AND_DISTANCE` mode.

  + All Options from [Switch](/components/switch#config-switch).

> [!NOTE]
> If you are having trouble controlling the `RUN` or `OUT` LEDs. Be sure to perform a a factory reset

{{< anchor "dfrobot_c4001-text_sensors" >}}

## Text Sensor

[Text Sensor Components](/components/text_sensor#config-text_sensor) provide read only text based information.

``` yaml
text_sensor:
  - platform: dfrobot_c4001
    dfrobot_c4001_id: mmwave_sensor
    software_version:
      name: Software Version
    hardware_version:
      name: Hardware Version
```

### Configuration variables

+ **software_version** (*Optional*): The Software Version as reported by the C4001 module.

  + All Options from [Text Sensor](/components/text_sensor#config-text_sensor).

+ **hardware_version** (*Optional*): The Hardware Version as reported by the C4001 module.
  
  + All Options from [Text Sensor](/components/text_sensor#config-text_sensor).

## See Also

+ [DFRobot mmWave C4001 (SEN0609) Radar Wiki page](https://wiki.dfrobot.com/SKU_SEN0609_C4001_mmWave_Presence_Sensor_25m)
+ [DFRobot mmWave C4001 (SEN0610) Radar Wiki page](<https://wiki.dfrobot.com/SKU_SEN0610_Gravity_C4001_mmWave_Presence_Sensor_12m_I2C_UART>)
