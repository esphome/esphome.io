---
description: "Instructions for setting up an LVGL widget switch."
title: "LVGL Switch"
params:
  seo:
    description: Instructions for setting up an LVGL widget switch.
    image: ../images/lvgl_c_swi.png
---

The `lvgl` switch platform creates a switch from an LVGL widget
and requires {{< docref "/components/lvgl/index" "LVGL" >}} to be configured.

Supported widgets are [`button`](#lvgl-widget-button) (with `checkable` option enabled), [`switch`](#lvgl-widget-switch) and [`checkbox`](#lvgl-widget-checkbox). A single switch supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome switch component.

## Configuration variables

- **widget** (**Required**): The ID of a supported widget configured in LVGL, which will reflect the state of the switch.
- All other variables from [Switch](#config-switch).

Example:

```yaml
switch:
  - platform: lvgl
    widget: checkbox_id
    name: LVGL switch
```

## See Also

- {{< docref "/components/lvgl/index" "LVGL Main component" >}}
- [Button widget](#lvgl-widget-button)
- [Switch widget](#lvgl-widget-switch)
- [Checkbox widget](#lvgl-widget-checkbox)
- {{< docref "/components/binary_sensor/lvgl" >}}
- {{< docref "/components/sensor/lvgl" >}}
- {{< docref "/components/number/lvgl" >}}
- {{< docref "/components/select/lvgl" >}}
- {{< docref "/components/light/lvgl" >}}
- {{< docref "/components/text/lvgl" >}}
- {{< docref "/components/text_sensor/lvgl" >}}
- {{< docref "/components/output" >}}
