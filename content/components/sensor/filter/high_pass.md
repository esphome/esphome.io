---
description: ""
headless: true
---

Basic [high pass filter](https://en.wikipedia.org/wiki/High-pass_filter>) for the sensor values,
assuming the sensor values are sampled at a constant rate. This filter will remove low-frequency
components and offset from the sensor values.

The formula for the high pass filter is: ``y[i] := α × y[i−1] + α × (x[i] − x[i−1])``,
where ``x`` is the input value and ``y`` is the output value.

A large α implies that the output will decay very slowly but will also be strongly influenced by
even small changes in input.

A small α implies that the output will decay quickly and will require large changes in the input
to cause the output to change much. A value of 0.5 (when time constant equal sampling period) might be a good starting point for experimentation.

```yaml
# Example configuration entry
- platform: wifi_signal
  # ...
  filters:
    - high_pass: 0.75
```

Configuration variables:

- **alpha** (*Required*, float): *Alpha* smoothing factor for the high pass filter. From 0 to 1.
