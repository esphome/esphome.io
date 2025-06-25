// Eleventy shortcode for ghuser
// Usage: {% ghuser name="octocat" text="@octocat" %}

module.exports = function(eleventyConfig) {
  eleventyConfig.addShortcode("ghuser", function({name, text}) {
    const label = text || `@${name}`;
    return `<a href="https://github.com/${name}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
};
