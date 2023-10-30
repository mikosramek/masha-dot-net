const fs = require("fs-extra");
const { JSDOM } = require("jsdom");

const loadFile = async (filePath) => {
  return new Promise((res, rej) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) return rej(err);
      return res(data.trim());
    });
  });
};

const writeFile = async (filePath, data) => {
  return new Promise((res, rej) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) return rej(err);
      res();
    });
  });
};

const generateNewsletter = async (
  htmlFilePath,
  cssFilePath,
  outputFilePath
) => {
  try {
    const html = await loadFile(htmlFilePath);
    const css = await loadFile(cssFilePath);

    let modifiedCSS = css
      .replaceAll("\n", "")
      .replaceAll("*/", "*/\n")
      .replaceAll(/\/\*.+\*\//g, "")
      .replaceAll("\n", "")
      .replaceAll("}", "}\n")
      .replaceAll(/@import url.+"\);/g, (match) => `${match}\n`);

    const rules = modifiedCSS.split("\n");

    const rulesForTop = [];
    const ruleMap = {};

    rules.forEach((rawLine) => {
      const matches = /^(.+) { (.+) }/g.exec(rawLine);
      if (matches) {
        const [_, cls, attr] = matches;

        if (cls[0] === "@") {
          rulesForTop.push(_);
        } else {
          const attributes = attr
            .split(";")
            .map((a) => a.trim())
            .filter((a) => !!a);
          const classes = cls.split(",").map((c) => c.trim());
          classes.forEach((className, i) => {
            if (ruleMap[className]) {
              ruleMap[className].push(...attributes);
            } else {
              ruleMap[className] = [...attributes];
            }
          });
        }
      } else {
        rulesForTop.push(rawLine);
      }
    });

    const moddedHTML = html
      .replaceAll(/<!--.+-->/g, "")
      .replaceAll(/\s{2,}\n/g, "")
      .replace('<link rel="stylesheet" href="styles.css" />', "");

    const dom = new JSDOM(moddedHTML);

    Object.entries(ruleMap).forEach(([cssClass, attributes]) => {
      const domElements = dom.window.document.querySelectorAll(cssClass);
      // remove duplicate attributes
      const attributeMap = {};
      attributes.forEach((a) => {
        const [attr, value] = a.split(": ");
        // replacing existing values means that the cascade is maintained
        attributeMap[attr] = value;
      });
      const css = `${Object.entries(attributeMap)
        .map(([k, v]) => `${k}: ${v};`)
        .join(" ")}`;
      domElements.forEach((node) => {
        node.style.cssText += css;
        if (node.nodeName === "HTML") {
          node.style.fontSize = attributeMap["font-size"];
        }
      });
    });

    // Create and attach header rules (mainly font styling)
    let headerStyles = "";
    rulesForTop.forEach((rule) => {
      headerStyles += `\n${rule}\n`;
    });
    const headerStyleTag = dom.window.document.createElement("style");
    headerStyleTag.innerHTML = headerStyles;
    dom.window.document.querySelector("head").append(headerStyleTag);

    writeFile(outputFilePath, dom.serialize());
  } catch (error) {
    console.error(error);
  }
};

module.exports = generateNewsletter;
