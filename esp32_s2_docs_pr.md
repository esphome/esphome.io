## Description:

Add ESP32-S2/S3 touch configuration guidance and working example

This PR improves the ESP32 touch documentation by adding a prominent info box that explains the critical timing differences between original ESP32 and S2/S3 variants. The default `measurement_duration` value of 8ms (optimized for original ESP32) often prevents touch detection from working on S2/S3 variants entirely. This documentation update provides a working configuration example with appropriate timing values that have been found to work across many S2/S3 devices.

**Related issue (if applicable):** fixes <link to issue>

**Pull request in [esphome](https://github.com/esphome/esphome) with YAML changes (if applicable):** 

- esphome/esphome#9059

## Checklist:

  - [ ] I am merging into `next` because this is new documentation that has a matching pull-request in [esphome](https://github.com/esphome/esphome) as linked above.  
    or
  - [x] I am merging into `current` because this is a fix, change and/or adjustment in the current documentation and is not for a new component or feature.

  - [ ] Link added in `/components/index.rst` when creating new documents for new components or cookbook.