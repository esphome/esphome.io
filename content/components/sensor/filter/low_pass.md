---
description: ""
headless: true
---

Basic [low pass filter](https://en.wikipedia.org/wiki/Low-pass_filter>) for the sensor values,
assuming the sensor values are sampled at a constant rate. This filter will remove high-frequency
components and noise from the sensor values.

The formula for the low pass filter is: ``y[i] := α * x[i] + (1-α) * y[i-1]``,
where ``x`` is the input value and ``y`` is the output value.

A lower α implies that the output will respond more slowly to changes in the input but will also
be less influenced by noise. We can say the system has more inertia. A value of 0.5 (when time constant equal sampling period) might be a good starting point for experimentation.

```yaml
# Example configuration entry
- platform: wifi_signal
  # ...
  filters:
    - low_pass: 0.25
```

Configuration variables:

- **alpha** (*Required*, float): *Alpha* smoothing factor for the low pass filter. From 0 to 1.
