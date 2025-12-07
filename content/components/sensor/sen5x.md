---
description: "Instructions for setting up SEN5X and SEN6X Series Environmental sensor for PM, RH/T, VOC, NOx, CO2 and HCHO measurements."
title: "SEN5X and SEN6X Series Environmental sensor"
params:
  seo:
    description: Instructions for setting up SEN5X and SEN6X Series Environmental sensor for PM, RH/T, VOC, and NOx measurements.
    image: sen54.jpg
---

The `sen5x` sensor platform allows you to use Sensirion
[SEN5X Series](https://sensirion.com/products/catalog/SEK-SEN5x) and
[SEN6X Series](https://sensirion.com/sen6x-air-quality-sensor-platform)
Environmental sensors with ESPHome.

The [I²C Bus](/components/i2c) is required in your configuration for this sensor to work.
This sensor supports both UART and I²C communication. Only I²C communication is implemented in this component.

## SEN5X Series

{{< img src="sen54.jpg" alt="Image" width="50.0%" class="align-center" >}}

```yaml
# Example SEN55 configuration entry
sensor:
  - platform: sen5x
    id: my_sen55
    pm_1_0:
      name: PM <1µm Weight concentration
    pm_2_5:
      name: PM <2.5µm Weight concentration
    pm_4_0:
      name: PM <4µm Weight concentration
    pm_10_0:
      name: PM <10µm Weight concentration
    temperature:
      name: Temperature
    humidity:
      name: Humidity
    voc:
      name: VOC
    nox:
      name: NOx
```

## SEN6X Series

{{< img src="sen66.jpg" alt="Image" width="50.0%" class="align-center" >}}

```yaml
# Example SEN66 configuration entry
sensor:
  - platform: sen5x
    id: my_sen66
    pm_1_0:
      name: PM <1µm Weight concentration
    pm_2_5:
      name: PM <2.5µm Weight concentration
    pm_4_0:
      name: PM <4µm Weight concentration
    pm_10_0:
      name: PM <10µm Weight concentration
    temperature:
      name: Temperature
    humidity:
      name: Humidity
    voc:
      name: VOC
    nox:
      name: NOx
    co2:
      name: CO₂
```

## Configuration variables

- **model** (*Required*, enum): The model of the connected sensor. Must be one of the following:
  SEN50, SEN54, SEN55, SEN60, SEN63C, SEN65, SEN66 or SEN68.

- **pm_1_0** (*Optional*): The information for the **Mass Concentration** of fine particles up to 1μm sensor.
  Readings in µg/m³.

  - All options from [Sensor](/components/sensor#config-sensor).

- **pm_2_5** (*Optional*): The information for the **Mass Concentration** of fine particles up to 2.5μm sensor.
  Readings in µg/m³.

  - All options from [Sensor](/components/sensor#config-sensor).

- **pm_4_0** (*Optional*): The information for the **Mass Concentration** of fine particles up to 4μm sensor.
  Readings in µg/m³.

  - All options from [Sensor](/components/sensor#config-sensor).

- **pm_10_0** (*Optional*): The information for the **Mass Concentration** of fine particles up to 10μm sensor.
  Readings in µg/m³.

  - All options from [Sensor](/components/sensor#config-sensor).

- **temperature** (*Optional*): The information for the Temperature sensor. Only available with SEN54, SEN55,
  SEN63C, SEN65, SEN66 or SEN68.

  - All options from [Sensor](/components/sensor#config-sensor).

- **humidity** (*Optional*): The information for the Relative Humidity sensor. Only available with SEN54, SEN55,
  SEN63C, SEN65, SEN66 or SEN68.

  - All options from [Sensor](/components/sensor#config-sensor).

- **co2** (*Optional*): The information for the Carbon dioxide (CO₂) sensor. Readings in ppm. Only available with
  SEN63C or SEN66.

  - **auto_self_calibration** (*Optional*, boolean): True enables automatic CO₂ self calibration.
  False disables automatic CO₂ calibration. Default is ``true``.
  - **altitude_compensation** (*Optional*, integer): When set to altitude (in meters), the CO₂ sensor will be
  compensated for deviations due to current altitude.
  - **ambient_pressure_compensation_source** (*Optional*, [ID](/guides/configuration-types#config-id)): Sets an external pressure sensor ID
  (must report in hPA). This will compensate the CO₂ sensor for deviations due to current pressure. More accurate
  than altitude compensation this correction is applied before each update of the state of the CO₂ sensor.

  - All options from [Sensor](/components/sensor#config-sensor).

- **hcho** (*Optional*): The information for the Formaldehyde (HCHO) sensor. Readings in ppb. Only available with
  SEN68.

  - All options from [Sensor](/components/sensor#config-sensor).

- **voc** (*Optional*): The information for the VOC Index sensor. Only available with SEN54, SEN55, SEN65, SEN66 or SEN68.

  - **algorithm_tuning** (*Optional*): The VOC algorithm can be customized by tuning 6 different parameters.
    For more details see
    [Engineering Guidelines for SEN5x](https://sensirion.com/media/documents/25AB572C/62B463AA/Sensirion_Engineering_Guidelines_SEN5x.pdf).

    - **index_offset** (*Optional*): VOC index representing typical (average) conditions.
      Allowed values are in range 1..250. The default value is 100.
    - **learning_time_offset_hours** (*Optional*): Time constant to estimate the VOC algorithm offset from the
      history in hours. Past events will be forgotten after about twice the learning time.
      Allowed values are in range 1..1000. The default value is 12 hour
    - **learning_time_gain_hours** (*Optional*): Time constant to estimate the VOC algorithm gain from the
      history in hours. Past events will be forgotten after about twice the learning time.
      Allowed values are in range 1..1000. The default value is 12 hours.
    - **gating_max_duration_minutes** (*Optional*): Maximum duration of gating in minutes (freeze of estimator
      during high VOC index signal). Zero disables the gating. Allowed values are in range 0..3000.
      The default value is 180 minutes
    - **std_initial** (*Optional*): Initial estimate for standard deviation. Lower value boosts events during
      initial learning period, but may result in larger device-to-device variations.
      Allowed values are in range 10..5000. The default value is 50.
    - **gain_factor** (*Optional*): Gain factor to amplify or to attenuate the VOC index output.
      Allowed values are in range 1..1000. The default value is 230.

  - All other options from [Sensor](/components/sensor#config-sensor).

- **nox** (*Optional*): The information for the NOx Index sensor. Only available with SEN55, SEN65, SEN66 or SEN68..

  - **algorithm_tuning** (*Optional*): The NOx algorithm can be customized by tuning 5 different parameters.
    For more details see
    [Engineering Guidelines for SEN5x](https://sensirion.com/media/documents/25AB572C/62B463AA/Sensirion_Engineering_Guidelines_SEN5x.pdf).

    - **index_offset** (*Optional*): NOx index representing typical (average) conditions.
      Allowed values are in range 1..250. The default value is 1.
    - **learning_time_offset_hours** (*Optional*): Time constant to estimate the NOx algorithm offset from the
      history in hours. Past events will be forgotten after about twice the learning time. The default value
      is 12 hour.
    - **learning_time_gain_hours** (*Optional*): Time constant to estimate the NOx algorithm gain from the
      history in hours. Past events will be forgotten after about twice the learning time.
      Allowed values are in range 1..1000. The default value is 12 hours.
    - **gating_max_duration_minutes** (*Optional*): Maximum duration of gating in minutes (freeze of estimator
      during high NOx index signal). Zero disables the gating. Allowed values are in range 0..3000.
      The default value is 720 minutes
    - **std_initial** (*Optional*): The initial estimate for standard deviation parameter has no impact
      for NOx. This parameter is still in place for consistency reasons with the VOC tuning parameters command.
      This parameter must always be set to 50.
    - **gain_factor** (*Optional*): Gain factor to amplify or to attenuate the VOC index output.
      Allowed values are in range 1..1000. The default value is 230.

  - All other options from [Sensor](/components/sensor#config-sensor).

- **store_baseline** (*Optional*, boolean): Stores and retrieves the baseline VOC and NOx information for
  quicker startups. Defaults to `true`
- **temperature_compensation** (*Optional*): These parameters allow to compensate temperature effects of the
  design-in at customer side by applying a custom temperature offset to the ambient temperature.

- **auto_cleaning_interval** (*Optional*): The periodic fan-cleaning interval in seconds.
Only available with sen50, SEN54 OR SEN55.

- **store_baseline** (*Optional*, boolean): Stores and retrieves the baseline VOC and NOx information for
  quicker startups. Defaults to `true`.

- **temperature_compensation** (*Optional*): These parameters allow to compensate temperature effects of the
  design-in at customer side by applying a custom temperature offset to the ambient temperature. Only available
  with SEN54 and SEN55.

  - **offset** (*Optional*): Temperature offset [°C]. Defaults to `0`.
  - **normalized_offset_slope** (*Optional*): Normalized temperature offset slope. Defaults to `0`.
  - **time_constant** (*Optional*): Time constant in seconds. Defaults to `0`.

- **acceleration_mode** (*Optional*): Allowed value are `low`, `medium` and `high`. Defaults to `low`.

  By default, the RH/T acceleration algorithm is optimized for a sensor which is positioned in free air.
  If the sensor is integrated into another device, the ambient RH/T output values might not be optimal
  due to different thermal behavior.
  This parameter can be used to adapt the RH/T acceleration behavior for the actual use-case, leading in an
  improvement of the ambient RH/T output accuracy. There is a limited set of different modes available.
  Medium and high accelerations are particularly indicated for air quality monitors which are subjected to
  large temperature changes. Low acceleration is advised for stationary devices not subject to large
  variations in temperature.

- **address** (*Optional*, int): Manually specify the I²C address of the sensor. Defaults to ``0x69`` for the
SEN5X sensors or ``0x6B`` for the SEN6X sensors.

> [!NOTE]
> This component reports readings as soon as they are available without regard initial accuracy.
> Your configuration should limit reporting of sensor value for a period of time after power-up. A good starting point is 5 minutes.
> The PM sensor has a start-up time of 30 seconds.
> The temperature sensor has a response time of 1 minute with no mention start-up time.
> The humidity sensor has a response time of 20 seconds with no mention start-up time.
> The VOC sensor will start detecting events in 1 minute but may take up to 1 hour to meet data sheet specifications.
> The NOx sensor will start detecting events in 5 minutes but may take up to 6 hours to meet data sheet specifications.
> The CO₂ sensor has a response time of between 60 and 70 seconds with no mention start-up time.
> The HCHO sensor has a start-up time of 10 minutes.

## Wiring

The both sensor series use a JST GHR-06V-S 6 pin type connector, with a 1.25mm pitch. The cable needs this
connector:

{{< img src="jst6pin.png" alt="Image" width="50.0%" class="align-center" >}}

The SEN5X series operates at 5V and must have pin no.5 shorted to GND. This forces the sensor into I²C mode.
I²C is the only mode supported by this component.

The SEN5X series operates at 3.3V and only supports I²C mode.

For better stability, the SDA and SCL lines require suitable pull-up resistors.

## Automatic Cleaning

The SEN5X sensors have an automatic fan-cleaning which will accelerate the built-in fan to maximum speed for
10 seconds in order to blow out the dust accumulated inside the fan. The default automatic-cleaning interval
is 168 hours (1 week) of uninterrupted use. Switching off the sensor resets this time counter. When the module
is in Measurement-Mode an automatic fan-cleaning procedure will be triggered periodically following a defined
cleaning interval. This will accelerate the fan to maximum speed for 10 seconds to blow out the accumulated
dust inside the fan.

- Measurement values are not updated while the fan-cleaning is running.
- The cleaning interval is set to 604,800 seconds (i.e., 168 hours or 1 week).
- The interval can be configured using the Set Automatic Cleaning Interval command.
- Set the interval to 0 to disable the automatic cleaning.
- A sensor reset, resets the cleaning interval to its default value
- If the sensor is switched off, the time counter is reset to 0. Make sure to trigger a cleaning cycle at least
  every week if the sensor is switched off and on periodically (e.g., once per day).
- The cleaning procedure can also be started manually with the `start_autoclean_fan` Action.

SEN6X sensors supports fan cleaning but not the automatic fan cleaning interval.

### `start_fan_autoclean` Action

This [action](/automations/actions#all-actions) manually starts fan-cleaning.

``` yaml
on_...:
  then:
    - sen5x.start_fan_autoclean: my_sen55
```

You can emulate the SEN5X automatic fan cleaning interval on the SEN6X sensors by using the `interval` component to
perform this action periodically. For example, to clean the fan every 7 days while the device is on, as
recommended by the manufacturer, the following configuration can be added:

``` yaml
interval:
  - interval: 7d
    then:
      - sen5x.start_fan_autoclean: my_sen66
```

## Humidity Sensor Heater

The SEN6X humidity sensor can develop an offset in the humidity reading when exposed to high levels of humidity
for extended periods of time. It supports a heater similar to the one in the SHT4X. The difference is no
automatic mode. Instead you have to trigger `sen5x.activate_heater` action occasionally.

### `activate_heater` Action

This [action](/automations/actions#all-actions) manually starts the heater. First all measurements are stopped,
then the heater is turned on at 200mW for 1s, finally there is a 20 second delay to before reenabling the
measurements. This is to ensure the heating effects are gone before temperature measurements resume.

``` yaml
on_...:
  then:
    - sen5x.activate_heater: my_sen66
```

## CO₂ Calibration and Compensation

The CO₂ sensor by default has auto-calibration enabled. Auto-calibration will adjust the minimum measurement over
the last week or so to the outdoor average of slightly more than 400 ppm. Auto-calibration assumes that you are
opening the windows at least once a week. If you don't open the windows then over time the CO₂ level will tend
downward.

If you know your minimums are not going to be 400 ppm then you can disable auto-calibration, occasionally
take the sensor outside for 5 minutes and then force a manual CO₂ calibration.

### `perform_forced_co2_calibration` Action

This [action](/automations/actions#all-actions) forces a manual calibration on the CO₂ sensor.

``` yaml
number:
  - platform: template
    id: co2_forced_cal_value
    name: "CO2 Calibration Value"
    device_class: carbon_dioxide
    entity_category: CONFIG
    optimistic: true
    max_value: 1200
    min_value: 400
    step: 1
    initial_value: 420
    set_action:
      - delay: 1s
button:
  - platform: template
    name: "CO2 Calibrate"
    entity_category: CONFIG
    on_press:
      - sen5x.perform_forced_co2_calibration:
          value: !lambda |-
            float value = id(co2_forced_cal_value).state;
            return value;
          id: sen66_sensor
```

The CO₂ sensor also supports pressure compensation. You can either add `ambient_pressure_compensation_source`
to your configuration and the CO₂ will retrieve an updated pressure just before a CO₂ update. Or you can
occasionally call the `sen5x.set_ambient_pressure_compensation` action.

### `set_ambient_pressure_compensation` Action

This [action](/automations/actions#all-actions) updates the current pressure used in CO₂ pressure compensation. Must be in hPa or mbar.

``` yaml
sensor:
  - platform: copy
    id: pressure_to_sen6x
    source_id: pressure
    unit_of_measurement: hPa
    filters:
      - lambda: |-
          // convert Pa to hPa (or mBar)
          return x / 100.0;
    on_value:
      then:
        - lambda: !lambda |-
            id(sen66_sensor)->set_ambient_pressure_compensation(x);
```

Altitude based compensation is also available when you set the `altitude_compensation` configuration variable
to your correct elevation in meters. Note:

> [!NOTE]
> `altitude_compensation` and `ambient_pressure_compensation_source`are mutually exclusive. If you plan on using
the `sen5x.set_ambient_pressure_compensation` action do not set either `altitude_compensation` or
`ambient_pressure_compensation_source` in your configuration.

## NOx and VOC Algorithm Tuning

Both the NOx and VOC sensor support algorithm tuning. These variables are set with the `algorithm_tuning`
configuration under the `voc` and `nox` sensors. For more details see
[Engineering Guidelines for SEN5X](https://sensirion.com/media/documents/25AB572C/62B463AA/Sensirion_Engineering_Guidelines_SEN5x.pdf)

## Temperature Compensation

The SEN54 and SEN55 contain and internal temperature compensation mechanism. The compensated ambient temperature is
calculated as follows:

``` c++
T_Ambient_Compensated = T_Ambient + (slope*T_Ambient) + offset
```

Where slope and offset are the values set with `temperature_compensation` configuration variables, smoothed with the
specified time constant, also a `temperature_compensation` configuration variable. The time constant is how fast the
slope and offset are applied. After the specified value in seconds, 63% of the new slope and offset are applied.

The STAR (Sensirion Temperature Acceleration Routine) engine set with `acceleration_mode` configuration variable
changes the responsiveness of both the temperature and humidity sensors.

More details about the tuning of these parameters are included in the application note
[Temperature Acceleration and Compensation Instructions for SEN5x](https://sensirion.com/media/documents/9B9DE2A7/61E957EB/Sensirion_Temperature_Acceleration_and_Compensation_Instructions_SEN.pdf).

The SEN63C, SEN65, SEN66 and SEN68 also support temperature compensation but Sensirion has not yet released the promised
`Temperature Acceleration and Compensation Instructions for SEN6x` document. While temperature compensation is similar
to the SEN5X it is not the same. So the current ESPHome component does not yet support Temperature Compensation for SEN6X sensors

## See Also

- [Sensor Filters](/components/sensor#sensor-filters)
- {{< docref "absolute_humidity/" >}}
- {{< docref "sds011/" >}}
- {{< docref "pmsx003/" >}}
- {{< docref "ccs811/" >}}
- {{< docref "scd4x/" >}}
- {{< docref "sps30/" >}}
- {{< docref "sgp4x/" >}}
- {{< docref "sht4x/" >}}
- {{< apiref "sen5x/sen5x.h" "sen5x/sen5x.h" >}}
