---
title: Restart Button
description: >-
  Instructions for setting up buttons that can remotely reboot the ESP in
  ESPHome.
seo:
  description: >-
    Instructions for setting up buttons that can remotely reboot the ESP in
    ESPHome.
  image: restart.svg
---

The `restart` button platform allows you to restart your node remotely
through Home Assistant.

```yaml
# Example configuration entry
button:
  - platform: restart
    name: "Living Room Restart"
```

## Configuration variables

- All options from [Button](/components/button#config-button).

## See Also

- [Link](shutdown/)
- [Link](safe_mode/)
- [Link](factory_reset/)
- [restart](/components/switch/restart)
- [Link](template/)
- ::apiref{text="restart/button/restart_button.h" path="restart/button/restart_button.h"}
