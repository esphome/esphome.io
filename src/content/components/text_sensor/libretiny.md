---
title: LibreTiny Text Sensor
description: Instructions for setting up LibreTiny text sensors.
seo:
  description: Instructions for setting up LibreTiny text sensors.
  image: libretiny.svg
---

The `libretiny` text sensor platform exposes various LibreTiny core
information via text sensors.

```yaml
# Example configuration entry
text_sensor:
  - platform: libretiny
    version:
      name: LibreTiny Version
```

## Configuration variables

- **version** (*Optional*): Expose the version of LibreTiny core as a text sensor. All options from
  [Text Sensor](/components/text_sensor#config-text_sensor).

## See Also

- [libretiny](/components/libretiny)
- ::apiref{text="libretiny/lt_component.h" path="libretiny/lt_component.h"}
