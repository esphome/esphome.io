const { resolve, join } = require("path");
const { statSync, existsSync, readdirSync } = require("fs");


module.exports = (eleventyConfig) => {
  // Auto-load all shortcodes/plugins from _config/
  const configDir = join(__dirname, "_config");
  if (existsSync(configDir)) {
    readdirSync(configDir).forEach((file) => {
      if (file.endsWith(".js")) {
        require(join(configDir, file))(eleventyConfig);
      }
    });
  }

  return {
    dir: {
      input: "content",
      output: "dist",
    },
    htmlTemplateEngine: "md",
    pathPrefix: "/",
  };
};
