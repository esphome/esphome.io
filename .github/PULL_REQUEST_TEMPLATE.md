## Description:


**Related issue (if applicable):** fixes <link to issue>

**Pull request in [esphome](https://github.com/esphome/esphome) with YAML changes (if applicable):** 

- esphome/esphome#<esphome PR number goes here>

## Checklist:

  - [ ] I am merging into `next` because this is new documentation that has a matching pull-request in [esphome](https://github.com/esphome/esphome) as linked above.  
    or
  - [ ] I am merging into `current` because this is a fix, change and/or adjustment in the current documentation and is not for a new component or feature.

  - [ ] Link added in `/components/index.rst` when creating new documents for new components or cookbook.

<details>
<summary><strong>New Component Images</strong></summary>

If you are adding a new component to ESPHome, you can automatically generate a standardized black and white component name image for the documentation.

**To generate a component image:**

1. Comment on this pull request with the following command, replacing `COMPONENT_NAME` with your component name in **UPPER_CASE** format with **underscores** (e.g., `BME280`, `SHT3X`, `DALLAS_TEMP`):

   ```
   @esphomebot generate image COMPONENT_NAME
   ```

2. The ESPHome bot will respond with a downloadable ZIP file containing the SVG image.

3. Extract the SVG file and place it in the `images/` folder of this repository.

4. Use the image in your component's index table entry in `/components/index.rst`.

**Example:** For a component called "DHT22 Temperature Sensor", use:
```
@esphomebot generate image DHT22
```

</details>
