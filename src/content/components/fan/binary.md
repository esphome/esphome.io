---
title: Binary Fan
description: Instructions for setting up binary fans.
seo:
  description: Instructions for setting up binary fans.
  image: fan.svg
---

The `binary` fan platform lets you represent any binary [Output Component](/components/output#output) as a fan.

::img{src="fan-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
fan:
  - platform: binary
    output: fan_output
    name: "Living Room Fan"
```

## Configuration variables

- **output** (**Required**, [ID](/guides/configuration-types#id)): The id of the
  binary output component to use for this fan.

- **oscillation_output** (*Optional*, [ID](/guides/configuration-types#id)): The id of the
  [output](/components/output#output) to use for the oscillation state of this fan. Default is empty.

- **direction_output** (*Optional*, [ID](/guides/configuration-types#id)): The id of the
  [output](/components/output#output) to use for the direction state of the fan. Default is empty.

- All other options from [Fan Component](/components/fan#config-fan).

## See Also

- [output](/components/output)
- [gpio](/components/output/gpio)
- [fan](/components/fan)
- ::apiref{text="fan/fan_state.h" path="fan/fan_state.h"}
