const { minify } = require("html-minifier-terser");

module.exports = function(eleventyConfig) {
    eleventyConfig.addTransform("htmlmin", async function (content, outputPath) {
        if (outputPath && outputPath.endsWith(".html")) {
            try {
                const minified = await minify(content, {
                    useShortDoctype: true,
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                });
                return minified;
            } catch(e) {
                console.warn("HTML minification failed:", e.message);
                return content;
            }
        }
        return content;
    });
}