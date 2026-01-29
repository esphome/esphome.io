# Modem Switch

:::caution
This switch platform enables or disables specific service characteristics for the `/components/modem` component.
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

switch:
  - platform: modem
    gnss:
      name: GNSS
      restore_mode: ALWAYS_ON
```

## Configuration variables

- **gnss** ([`object`](https://esphome.io/components/switch/index.html#config-switch)_,
  _optional_): Enable/disable GNSS. Only available for modem models `SIM7600` and `SIM7670`. All options from
  [Switch](https://esphome.io/components/switch/index.html#config-switch).

## See Also

- [`Modem`](/components/modem)
- [`Modem Sensor`](/components/sensor/modem)
- [`Sensor Filters`](/components/sensor/index.html#sensor-filters)
- [`Edit this page on GitHub`](https://github.com/esphome/esphome-docs/edit/current/content/components/switch/modem.rst)
