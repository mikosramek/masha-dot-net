const path = require("path");
const fs = require("fs");
const sass = require("node-sass");

const outFile = path.resolve(__dirname, "..", "static", "styles.css");

const compileSass = () => {
  return new Promise((resolve, reject) => {
    sass.render(
      {
        includePaths: [path.resolve(__dirname, "..", "styles")],
        file: path.resolve(__dirname, "..", "styles", "styles.scss"),
        outFile,
      },
      (renderError, result) => {
        if (renderError) return reject(renderError);

        fs.writeFile(outFile, result.css, (writeError) => {
          if (writeError) return reject(writeError);
          resolve();
        });
      }
    );
  });
};

module.exports = compileSass;
