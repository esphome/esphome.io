# GPS Component

:::caution
The `gps` component allows you to connect GPS modules to your ESPHome project. Any GPS module that uses the standardized NMEA communication protocol will work.
:::

{{< figure src="images/gps-full.jpg" alt="GPS Module" width="50%" >}}
GPS Module. Image by [Adafruit](https://www.adafruit.com/product/746)

For this component to work you need to have set up a [UART bus](/components/uart) in your configuration - only the RX pin should be necessary.

```yaml
# Example configuration entry

# Declare GPS module
gps:
  latitude:
    name: "Latitude"
  longitude:
    name: "Longitude"
  altitude:
    name: "Altitude"

# GPS as time source
time:
  - platform: gps
```

The component is split up in platforms, by defining the GPS module (as seen above).

In addition to retrieving GPS position data, the module can also be used as a time platform to get the current date and time via the very accurate GPS clocks without a network connection.

See [GPS Time](/components/time/gps) for config options for the GPS time source.

## Configuration variables

- **uart_id** ([`ID`](/guides/configuration-types#id)_, optional_): Manually specify the ID of the [UART Component](/components/uart), or of the [Nmea](/components/modem#nmea_schema) from the [Modem](/components/modem).
- **latitude** (_Optional_): Include the Latitude as a sensor.
  - All options from [Sensor](/components/sensor).
- **longitude** (_Optional_): Include the Longitude as a sensor.
  - All options from [Sensor](/components/sensor).
- **speed** (_Optional_): Include the measured speed as a sensor.
  - All options from [Sensor](/components/sensor).
- **course** (_Optional_): Include the measured course as a sensor.
  - All options from [Sensor](/components/sensor).
- **altitude** (_Optional_): Include the measured altitude as a sensor.
  - All options from [Sensor](/components/sensor).
- **satellites** (_Optional_): Include the number of tracking satellites being used as a sensor.
  - All options from [Sensor](/components/sensor).
- **hdop** (_Optional_): Include the measured HDOP (Horizontal Dilution Of Precision) as a sensor.
  - All options from [Sensor](/components/sensor).
- **update_interval** ([`Time`](/guides/configuration-types#time)_, optional_): The interval of sensor updates. Defaults to `20s`.

## See Also

- [Sensor Filters](/components/sensor/index.html#sensor-filters)
- [`Modem`](/components/modem)
- [TinyGPS++ library](http://arduiniana.org/libraries/tinygpsplus/)
- [`gps/gps.h`](https://github.com/esphome/esphome/blob/dev/esphome/components/gps/gps.h)
- [`Edit this page on GitHub`](https://github.com/esphome/esphome-docs/edit/current/components/gps.rst)
