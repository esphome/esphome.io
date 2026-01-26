---
title: Safe Mode Switch
description: >-
  Instructions for setting up switches that can remotely reboot the ESP in
  ESPHome into safe mode.
seo:
  description: >-
    Instructions for setting up switches that can remotely reboot the ESP in
    ESPHome into safe mode.
  image: restart.svg
---

The `safe_mode` switch allows you to remotely reboot your node into [safe_mode](/components/safe_mode). This is useful in certain situations where a misbehaving component, or low memory state is preventing Over-The-Air updates from completing successfully.

This component requires [safe_mode](/components/safe_mode) to be configured.

::img{src="safemode-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
switch:
  - platform: safe_mode
    name: "Living Room Restart (Safe Mode)"
```

## Configuration variables

- All options from [Switch](/components/switch#config-switch).

## See Also

- [Link](shutdown/)
- [Link](restart/)
- [Link](factory_reset/)
- [safe_mode](/components/button/safe_mode)
- [Link](template/)
- ::apiref{text="safe_mode/safe_mode_switch.h" path="safe_mode/safe_mode_switch.h"}
