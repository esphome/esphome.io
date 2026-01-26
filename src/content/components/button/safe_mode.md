---
title: Safe Mode Button
description: >-
  Instructions for setting up buttons that can remotely reboot the ESP in
  ESPHome into safe mode.
seo:
  description: >-
    Instructions for setting up buttons that can remotely reboot the ESP in
    ESPHome into safe mode.
  image: restart.svg
---

The `safe_mode` button allows you to remotely reboot your node into [safe_mode](/components/safe_mode). This is useful in certain situations
where a misbehaving component is preventing Over-The-Air updates from completing successfully.

This component requires [safe_mode](/components/safe_mode) to be configured.

::img{src="safemode-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
button:
  - platform: safe_mode
    name: "Living Room Restart (Safe Mode)"
```

## Configuration variables

- All options from [Button](/components/button#config-button).

## See Also

- [Link](shutdown/)
- [Link](restart/)
- [Link](factory_reset/)
- [safe_mode](/components/switch/safe_mode)
- [Link](template/)
- ::apiref{text="safe_mode/safe_mode_button.h" path="safe_mode/safe_mode_button.h"}
