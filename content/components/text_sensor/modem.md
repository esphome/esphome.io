# Modem Text Sensor

:::caution
This text sensor platform queries the `/components/modem` component for specific service characteristic values.
:::

:::note
The `/components/modem` component must have `enable_cmux` set to `True`.
:::

```yaml
modem:
  id: atmodem
  model: SIM7600
  enable_cmux: True
  apn: orange

text_sensor:
  - platform: modem
    network_type:
      name: network type
    update_interval: 10s
```

## Configuration variables

- **network_type** ([`string`](/components/text_sensor/#config-text_sensor)_, optional_): Expose the modem network type (GSM, GPRS, LTE...) as a text sensor. All options from [Text Sensor](/components/text_sensor/#config-text_sensor).
- **update_interval** ([`Time`](/guides/configuration-types/#time)_, optional_): The interval to poll the device. Defaults to `60s`.
- All other options from [Text Sensor](/components/text_sensor/#config-text_sensor).

## See Also

- [`Modem`](/components/modem)
- [`Modem Sensor`](/components/sensor/modem)
- [`Sensor Filters`](/components/sensor/index.html#sensor-filters)
- [`Edit this page on GitHub`](https://github.com/esphome/esphome-docs/edit/current/content/components/text_sensor/modem.rst)
