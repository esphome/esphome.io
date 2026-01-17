---
description: "Zephyr GDB coredump"
title: "Zephyr GDB coredump"
---

```yaml
# Example configuration entry
esphome:
  name: coredump-test
  on_boot:
    then:
      - delay: 30s
      - lambda: |-
          volatile uint32_t *p = (uint32_t *)0xDEADBEEF;
          *p = 0xDEADBEEF;

zephyr_coredump:
```

## See Also