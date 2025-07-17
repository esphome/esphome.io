## Description:


**Related issue (if applicable):** fixes <link to issue>

**Pull request in [esphome](https://github.com/esphome/esphome) with YAML changes (if applicable):** 

- esphome/esphome#<esphome PR number goes here>

## Checklist:

  - [ ] I am merging into `next` because this is new documentation that has a matching pull-request in [esphome](https://github.com/esphome/esphome) as linked above.  
    or
  - [ ] I am merging into `current` because this is a fix, change and/or adjustment in the current documentation and is not for a new component or feature.

  - [ ] Link added in `/components/index.rst` when creating new documents for new components or cookbook.

## New Component images

If you are adding a new component to ESPHome and you want to use the black and white component name images we use instead of a photo of the product,
you can comment on this pull request with the following where the component name is written in upper case and with underscores (e.g. `COMPONENT_NAME`):

```
@esphomebot generate image COMPONENT_NAME
```

The workflow will comment back with a link to download the svg image inside a zip file. You can then copy that svg into the `images` folder and use it
for the component index table.
