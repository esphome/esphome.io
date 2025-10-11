---
description: "Instructions for setting up VL53L1X distance sensors in ESPHome."
title: "VL53L1X Time Of Flight Distance Sensor"
params:
  seo:
    description: Instructions for setting up VL53L1X distance sensors in ESPHome.
    image: vl53l1x-full.jpg
---

The `vl53l1x` sensor platform allows you to use VL53L1X optical time of flight
([datasheet](https://www.st.com/resource/en/datasheet/vl53l1x.pdf)) with ESPHome
to measure distances. The sensor works optically by emitting short infrared pulses
and measuring the time it takes the light to be reflected back

The sensor can measure distances up to 4 meters, though that figure depends significantly
on several conditions like surface reflectance, field of view, temperature etc. 

{{< img src="vl53l1x-full.png" alt="Depiction of the VL53L1x sensor" width="100.0%" class="align-center" >}}

The [I²C Bus](#i2c) is required to be set up in your configuration for this sensor to work.

- `VCC` connects to 3V3 (`3V3` will output 3.3V), or directly connect `VCC` to 3.3V
- `GND` connects to ground
- `SCL` connects I2C SCL (clock)
- `SDA` connects I2C SDA (data)
- `INT` connect to a free GPIO internal input pin. The pin is used to trigger an update of the sensor value when a reading is ready. 
- `XSHUT` connects to free GPIO pin. Enable/disable device. This is optional if there is only one
  vl53l1X sensor on the I²C bus and the default `0x29` address is used. Otherwise this is required.


```yaml
i2c:
  scl: GPIOXX
  sda: GPIOXX
  frequency: 400khz  # The sensor expects a 400khz i2c bus.

sensor:
  - platform: vl53l1x
    name: "All Configuration Options"

    # Conditionally required: Must be set when multiple VL53L1X Sensors
    # are connected on the same bus.
    address: 0x29 # Default: 0x29

    # Conditionally required: Must be set if address is not
    # 0x29 or there are multiple VL53L1X Sensors connected on the same bus.
    enable_pin: GPIOXX

    # Optional: If set, the sensor will operate in interrupt mode,
    # if not set, it will operate in polling mode.
    interrupt_pin: GPIOXX

    # Optional: How often the sensor will update its value.
    update_interval: 60s # Default: 60s

    # Optional:
    #   short: Higher precision, but can only measure values < 0.5m
    #   long:  Lower precision, but can measure values < 4.0m
    distance_mode: long # Default: short

    # Optional: How long the sensor will spend per measurement, longer timing budget generally
    # means more accurate results.
    # Valid values are: (15ms, 20ms, 33ms, 50ms, 100ms, 200ms, 500ms)
    # If 'distanse_mode' = long, then 'timing_budget' must be >= 20ms.
    timing_budget: 50ms  # Default: 50ms

    # Optional: The sensor has a 27 degree detection region divided into a 16x16 grid.
    # Region of interest allows a smaller region to be selected to account for challenging
    # geometries.
    # The region is specified by the bottom-left corner (x, y) of a detection rectangle (w x h).
    # The smallest region allowed is a 4x4 rectangle. The full rectangle must specified be within
    # the bounds.
    region_of_interest:
      x: 0
      y: 0
      w: 16
      h: 16

    # Optional: When operating in interrupt mode, the sensor can be configured to only trigger interrupts
    # for measurements within the given bounds.
    distance_threshold:
      # Required: When to interrupt
      #  below_min - only interrupt when the measurement is below 'min'.
      #  above_max - only interrupt when the measurement is above 'max'.
      #  inside_window - only interrupt when the measurement is between 'min' and 'max'.
      #  outside_window - only interrupt when the measurement is outside 'min' and 'max'.
      interrupt_when: inside_window

      # Conditional, as required by 'interrupt_when'.
      min: 0.5m
      # Conditional, as required by 'interrupt_when'.
      max: 1m

    # Optional: Offset the value reported by the sensor.
    offset: 0.0m  # Default: 0m

    # Optional: This is the number of photons reflected back from any added cover glass in cps (count per second).
    xtalk_correction: 0  # Default: 0

    # Optional: Set a new signal threshold in kcps (count per second)
    signal_threshold: 1024 # Default: 1024

    # Optional: Set a new sigma threshold in mm
    sigma_threshold: 15 # Default: 15
```

## Configuration variables

- **address** (*Conditional*, int): Manually specify the i2c address of the sensor. Defaults to `0x29`.
  If an address other the `0x29` is specified, the sensor will be dynamically re-addressed at startup.
  A dynamic re-address of sensor **requires** the `enable_pin` configuration variable to be assigned.
  If more then one VL53L1X sensor is used on the same i2c bus, a unique address must be specified per sensor.

- **enable_pin** (*Conditional*, [Pin Schema](#config-pin_schema)): The pin connected to XSHUT
  on vl53l1x to enable/disable sensor. **Required** if not using address `0x29` which is the cause if you
  have multiple vl53l1X on the same i2c bus. In this case you have to assign a different pin to each vl53l1X.

- **interrupt_pin** (*Optional*, [Pin Schema](#config-pin_schema)): The pin connected to INT on the vl53l1x to 
  receive interrupts once measurements are ready. Setting this option will enable interrupt mode. Using interrupt mode will be more efficient and allow the distance_threshold option.  
  If the interrupt pin is not set, the sensor driver will use polling mode.

- **update_interval** (*Optional*, [Time](#config-time)): How often the sensor will update its state. This value also specifies the internal measurement rate of the sensor. Defaults to `60s`.

- **timing_budget** (*Optional*, (15ms, 20ms, 33ms, 50ms, 100ms, 200ms, 500ms)): Set the timing budget the sensor will use for a single range measurement.
  Range is from The timing budget allows the user to trade off speed for accuracy.
  If not specified, the default timing budget is 50ms.
  Note that when distance mode is long, the timing budget must be at least 20ms.

- **distance_mode**: (*Optional*, (short, long)): Set the distance mode for the sensor. vl53l1x has two 
  modes:
  - *short* (default): Higher precision, but can only measure values < 0.5m
  - *long*:  Lower precision, but can measure up to 4.0m

- **region_of_interest**: (*Optional*, object):
    vl53l1x has a 27 degree detection region divided into a 16x16 grid internally.
    It is possible to reduce the detection region in order to account for more challenging 
    geometries.

    The region to use for measurements is specified as a rectangle in a 16x16 grid, zero-indexed.
    The rectangle is specified by its bottom-left corner and the rectangle's width and height.

    Note that the rectangle must be at least 4x4 large and must remain fully within the 16x16 grid.
  
    Examples:
    ```yaml
    # Full region
    region_of_interest: 
      x: 0
      y: 0
      w: 16
      h: 16
    ```
    ```yaml
    # Only the top 4 rows
    region_of_interest: 
      x: 0
      y: 12
      w: 16
      h: 4
    ```
- **distance_threshold**: (*Optional*, object):
    When operating in interrupt mode, the sensor can be configured to only trigger interrupts
    for measurements within the given bounds. For example the sensor can be configured to only detect
    measurements smaller than 1m. 

    - **interrupt_when**: (*Required*, (below_min, above_max, inside_window, outside_window)):
      The condition for when the sensor shall interrupt the the ESPHome controller to report a new state.
      - *below_min*: Only interrupt when the measurement is below 'min'.
      - *above_max*: Only interrupt when the measurement is above 'max'.
      - *inside_window*: Only interrupt when the measurement is between 'min' and 'max'.
      - *outside_window*: Only interrupt when the measurement is less than 'min' or larger than 'max'.

    - **min**: (*Conditional*, [Distance](#config-distance)): Lower bound of the distance threshold.
    - **max**: (*Conditional*, [Distance](#config-distance)): Lower bound of the distance threshold.
      
  
- **offset**: (*Optional*, [Distance](#config-distance)): You can use this option measure offset the 
  distance reported by the sensor. 
  
- **xtalk_correction**: (*Optional*, integer): When the sensor is mounted behind a 
  cover glass, the photons reflected by the glass can interfere with the measurements. In this case use the xtalk correction to adjust the measurements. The correction is measured in photons per second.

- **signal_threshold**: (*Optional*, integer): You can use this option to override the minimum signal 
  sample size required by the sensor to make a measurement. Increasing it can improve precision but may require a longer timing budget. 

  The default value is 1024 (kcps: 1000 photons per second).

- **sigma_threshold**: (*Optional*, integer): When the sensor measures distance the end result is 
  calculated based on the distribution of the timing of the detected photons reflected back from the
  obstructing object. 

  In order to filter out noise, the sensor will refine the measurement until the standard-deviation of the sample is less than the sigma threshold.

  Sigma threshold is measured in millimeters and the default threshold is 15mm.


- All other options from [Sensor](#config-sensor).



## See Also

- [Sensor Filters](#sensor-filters)
- {{< apiref "vl53l1x/vl53l1x_sensor.h" "vl53l1x/vl53l1x_sensor.h" >}}

