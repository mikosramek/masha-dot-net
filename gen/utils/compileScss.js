const path = require("path");

const sass = require("node-sass");

const compileSass = () => {
  return new Promise((resolve, reject) => {
    sass.render(
      {
        includePaths: [path.resolve(__dirname, "..", "styles")],
      },
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

module.exports = compileSass;
