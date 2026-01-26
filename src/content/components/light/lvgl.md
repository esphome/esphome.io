---
title: LVGL Light
description: Instructions for setting up an LVGL widget light.
seo:
  description: Instructions for setting up an LVGL widget light.
  image: ../images/lvgl_c_lig.png
---

The `lvgl` light platform creates a light from an LVGL widget
and requires [LVGL](/components/lvgl/index) to be configured.

Supported widget is [`led`](/components/lvgl/widgets#lvgl-widget-led). A single light supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome light component.

## Configuration variables

- **widget** (**Required**): The ID of a `led` widget configured in LVGL, which will reflect the state of the light.
- All other options from [light](/components/light#config-light).

Example:

```yaml
light:
  - platform: lvgl
    widget: led_id
    name: LVGL light
```

> [!NOTE]
> To have linear brightness control, `gamma_correct` of the light is set by default to `0`.

## See Also

- [LVGL Main component](/components/lvgl/index)
- [LED widget](/components/lvgl/widgets#lvgl-widget-led)
- [lvgl](/components/binary_sensor/lvgl)
- [lvgl](/components/sensor/lvgl)
- [lvgl](/components/number/lvgl)
- [lvgl](/components/switch/lvgl)
- [lvgl](/components/select/lvgl)
- [lvgl](/components/text/lvgl)
- [lvgl](/components/text_sensor/lvgl)
