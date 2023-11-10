const fs = require("fs-extra");
const path = require("path");
const generateNewsletter = require("./utils/generateNewsletter");
const fileGen = require("./utils/gen-utils");

const newsletter = async () => {
  try {
    console.log("Compiling newsletter...");
    await generateNewsletter(
      path.resolve(fileGen.buildPath, "newsletter", "raw", "index.html"),
      path.resolve(fileGen.buildPath, "styles.css"),
      path.resolve(fileGen.buildPath, "newsletter", "index.html")
    );
    console.log("Done");

    console.log("Cleaning up raw files...");
    await fs.remove(path.resolve(fileGen.buildPath, "newsletter", "raw"));
    console.log("Done");
  } catch (error) {
    console.error(error);
  }
};

module.exports = newsletter;
