---
title: Restart Switch
description: >-
  Instructions for setting up switches that can remotely reboot the ESP in
  ESPHome.
seo:
  description: >-
    Instructions for setting up switches that can remotely reboot the ESP in
    ESPHome.
  image: restart.svg
---

The `restart` switch platform allows you to restart your node remotely
through Home Assistant.

::img{src="restart-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
switch:
  - platform: restart
    name: "Living Room Restart"
```

## Configuration variables

- All options from [Switch](/components/switch#config-switch).

## See Also

- [Link](shutdown/)
- [Link](safe_mode/)
- [Link](factory_reset/)
- [restart](/components/button/restart)
- [Link](template/)
- ::apiref{text="restart/switch/restart_switch.h" path="restart/switch/restart_switch.h"}
