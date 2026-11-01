<!-- markdownlint-disable -->

## Description

**Related issue (if applicable):** fixes <link to issue>

**Pull request in [esphome](https://github.com/esphome/esphome) with YAML changes (if applicable):**

- esphome/esphome#<esphome PR number goes here>

## Checklist

- [ ] I am merging into `next` because this is new documentation that has a matching pull-request in [esphome](https://github.com/esphome/esphome) as linked above.
  or
- [ ] I am merging into `current` because this is a fix, change and/or adjustment in the current documentation and is not for a new component or feature.

- [ ] Link added in `/src/content/docs/components/index.mdx` when creating new documents for new components or cookbook.

<details>
<summary><strong>New Component Images</strong></summary>

If you are adding a new component to ESPHome and have no photo of it, use a standardized black and white component name badge. Badges are generated when the site is built, so there is no image file to add.

Set the image of your component's entry in `/src/content/docs/components/index.mdx` to `badge:` followed by the text to show, using letters, digits, hyphens and underscores (underscores are shown as spaces):

```
["DHT22", "/components/sensor/dht/", "badge:DHT22", "Temperature & Humidity"],
```

**Note:** All other images used in ImgTable components must be placed in `/public/images/` as the component resolves them to absolute paths.

</details>
