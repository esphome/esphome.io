// Eleventy shortcode for pr
// Usage: {% pr "123""esphome" %}

module.exports = function(eleventyConfig) {
  eleventyConfig.addShortcode("pr", function(content) {
    return `<div class="admonition pr"><p class="admonition-title">PR</p>${content}</div>`;
  });
};
