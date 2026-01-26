---
title: Generic Output Lock
description: >-
  Instructions for setting up generic output locks in ESPHome that control an
  output component.
seo:
  description: >-
    Instructions for setting up generic output locks in ESPHome that control an
    output component.
  image: upload.svg
---

The `output` lock platform allows you to use any output component as a lock.

::img{src="output-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
output:
  - platform: gpio
    pin: GPIOXX
    id: 'generic_out'
lock:
  - platform: output
    name: "Generic Output"
    output: 'generic_out'
```

## Configuration variables

- **output** (**Required**, [ID](/guides/configuration-types#id)): The ID of the output component to use.
- All other options from [Lock](/components/lock#config-lock).

## See Also

- [output](/components/output)
- ::apiref{text="output/lock/output_lock.h" path="output/lock/output_lock.h"}
