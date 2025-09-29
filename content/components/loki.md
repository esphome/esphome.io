---
description: "Instructions for setting up a loki component in ESPHome"
title: "Loki Component"
params:
  seo:
    description: Instructions for setting up a loki component in ESPHome
---

The `loki` component can be used to send ESPHome logs to a [loki server](https://grafana.com/oss/loki/).
It requires both a {{< docref "http_request" "HTTP Request" >}} and a {{< docref "time/index" "Time component" >}} to be configured.

```yaml
# Example configuration entry

http_request:
  useragent: esphome/loki
  timeout: 10s
  verify_ssl: false

time:
  - platform: sntp
    id: sntp_time

loki:
  url: http://foo.com
  level: DEBUG
  enabled: true
```

## Configuration Options

- **id** (*Optional*, [ID](#config-id)): Manually specify the ID used for code generation.
- **http_request_id** (**Required**, [ID](#config-id)): The ID of the http_request client to use for sending logs. May be omitted if only
  one http_request client is configured.
- **time_id** (**Required**, [ID](#config-id)): The ID of the time client to use for time-stamping logs. May be omitted
  if only one time client is configured.
- **port** (*Optional*, int): The port of the `loki` instance to send logs to. Defaults to `3100`.
- **level** (*Optional*, string): The highest log level to send to the loki server. Defaults to `DEBUG`.
- **strip** (*Optional*, boolean): If set, remove color-codes from log messages. Defaults to `true`.
