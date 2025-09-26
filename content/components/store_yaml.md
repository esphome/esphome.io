---
description: "Instructions for storing your device's YAML configuration directly on the device."
title: "Store YAML component"
params:
  seo:
    description: Instructions for storing your device's YAML configuration directly on the device.
---

This component allows storing the flattened YAML in microcontroller's flash memory so that it may be retrieved in the
event that the original was lost. The amount of space required to store the YAML file will vary but is typically a few
kilobytes.

The YAML file is compressed before storing it as a part of the compiled firmware. Specifically, `__init__.py` uses a
dictionary-based compression to compress `CORE.config` into a global `const` byte array (`ESPHOME_YAML`) which can
later be logged with an action.

```yaml
# Example configuration entry
store_yaml:
  show_in_dump_config: False
  show_secrets: True
  http:
    url: /config
```

## Configuration variables

- **show_in_dump_config** (*Optional*, boolean): Set to ``true`` to display the YAML when the device performs its
  configuration dump (done each time a client connects by way of the `dump_config()` method).

- **show_secrets** (*Optional*, boolean): Replace `!secret ...` with their real values.

- **url** (*Optional*, string): The request string to use for the web server. Does not support RP2040.

{{< warning >}}
`show_in_dump_config` may trigger a watchdog reboot and safe mode when the configuration is too large to be sent quickly.
{{< /warning >}}

## `store_yaml.log` action

Send YAML to the logger.

```yaml
api:
  services:
    - service: 'log_yaml'
      then:
        - store_yaml.log
```

## See Also

- {{< apiref "store_yaml/store_yaml.h" "store_yaml/store_yaml.h" >}}
