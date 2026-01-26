---
title: LVGL Text
description: Instructions for setting up an LVGL Text component.
seo:
  description: Instructions for setting up an LVGL Text component.
  image: ../images/lvgl_c_txt.png
---

The `lvgl` text platform creates an editable text component from an LVGL textual widget and requires [LVGL](/components/lvgl/index) to be configured.

Supported widgets are [`label`](/components/lvgl/widgets#lvgl-widget-label) and [`textarea`](/components/lvgl/widgets#lvgl-widget-textarea). A single text supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome text component.

## Configuration variables

- **widget** (**Required**): The ID of a `textarea` widget configured in LVGL, which will reflect the state of the text component.
- All other variables from [Text](/components/text#config-text).

Example:

```yaml
text:
  - platform: lvgl
    widget: textarea_id
    name: "Textarea 1 text"
```

> [!NOTE]
> Widget-specific actions (`lvgl.label.update`, `lvgl.textarea.update`  ) will trigger correspponding component updates to be sent to Home Assistant.

## See Also

- [LVGL Main component](/components/lvgl/index)
- [Label widget](/components/lvgl/widgets#lvgl-widget-label)
- [Textarea widget](/components/lvgl/widgets#lvgl-widget-textarea)
- [lvgl](/components/binary_sensor/lvgl)
- [lvgl](/components/sensor/lvgl)
- [lvgl](/components/number/lvgl)
- [lvgl](/components/switch/lvgl)
- [lvgl](/components/light/lvgl)
- [lvgl](/components/select/lvgl)
- [lvgl](/components/text_sensor/lvgl)
