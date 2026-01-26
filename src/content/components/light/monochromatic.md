---
title: Monochromatic Light
description: Instructions for setting up monochromatic (brightness-only) lights.
seo:
  description: Instructions for setting up monochromatic (brightness-only) lights.
  image: brightness-medium.svg
---

The `monochromatic` light platform creates a simple brightness-only light from a
[float output component](/components/output#output).

::img{src="monochromatic-strip.jpg" alt="Image" caption="Example of a brightness-only LED strip that can be used with this component." width="75.0%" class="align-center"}

::img{src="kitchen-lights.png" alt="Image" width="40.0%" class="align-center"}

```yaml
# Example configuration entry
light:
  - platform: monochromatic
    name: "Kitchen Lights"
    output: output_component1
```

## Configuration variables

- **output** (**Required**, [ID](/guides/configuration-types#id)): The id of the float [Output Component](/components/output#output) to use for this light.
- All other options from [Light](/components/light#config-light).

## See Also

::img{src="monochromatic-detail.jpg" alt="Image" width="75.0%" class="align-center"}

- [output](/components/output)
- [light](/components/light)
- [binary](/components/light/binary)
- [power_supply](/components/power_supply)
- [ledc](/components/output/ledc)
- [esp8266_pwm](/components/output/esp8266_pwm)
- [pca9685](/components/output/pca9685)
- [tlc59208f](/components/output/tlc59208f)
- [my9231](/components/output/my9231)
- ::apiref{text="monochromatic/monochromatic_light_output.h" path="monochromatic/monochromatic_light_output.h"}
