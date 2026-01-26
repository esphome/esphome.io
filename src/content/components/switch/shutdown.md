---
title: Shutdown Switch
description: Instructions for setting up switches that can remotely shut down the ESP.
seo:
  description: Instructions for setting up switches that can remotely shut down the ESP.
  image: power_settings.svg
---

The `shutdown` switch platform allows you to shutdown your node remotely
through Home Assistant. It does this by putting the node into deep sleep mode with no
wakeup source selected. After enabling, the only way to startup the ESP again is by
pressing the reset button or restarting the power supply.

::img{src="shutdown-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
switch:
  - platform: shutdown
    name: "Living Room Shutdown"
```

## Configuration variables

- All options from [Switch](/components/switch#config-switch).

## See Also

- [Link](restart/)
- [Link](safe_mode/)
- [Link](factory_reset/)
- [shutdown](/components/button/shutdown)
- [Link](template/)
- ::apiref{text="shutdown/shutdown_switch.h" path="shutdown/shutdown_switch.h"}
