# Modem Sensor

:::caution
The modem sensor platform queries the `/components/modem` component for specific values.
:::

:::note
The `/components/modem` component must have `enable_cmux` set to `True`.
:::

```yaml
modem:
  id: atmodem
  rx_pin: GPIO26
  tx_pin: GPIO27
  status_pin: GPIO34
  model: SIM7600
  apn: orange
  enable_cmux: True

sensor:
- platform: modem
  rssi:
    name: rssi
  ber:
    name: ber
```

## Configuration variables

- **rssi** ([`number`](https://esphome.io/components/sensor/index.html#config-sensor)_, optional_): Received Signal Strength Indicator (RSSI) in dB. The range is from -113 dB (weakest) to -51 dB (strongest). All options from [Sensor](https://esphome.io/components/sensor/index.html#config-sensor).
- **ber** ([`number`](https://esphome.io/components/sensor/index.html#config-sensor)_, optional_): Bit Error Rate (BER) in percent (%). This may not be available on all modem models. All options from [Sensor](https://esphome.io/components/sensor/index.html#config-sensor).
- **update_interval** ([`Time`](https://esphome.io/guides/configuration-types#time)_, optional_): The interval to poll the modem for new values. Defaults to `60s`.
- All other options from [Sensor](https://esphome.io/components/sensor/index.html#config-sensor).

## See Also

- [`Modem`](/components/modem)
- [`Modem Text Sensor`](/components/text_sensor/modem)
- [`Sensor Filters`](/components/sensor/index.html#sensor-filters)
- [`Edit this page on GitHub`](https://github.com/esphome/esphome-docs/edit/current/content/components/sensor/modem.rst)
