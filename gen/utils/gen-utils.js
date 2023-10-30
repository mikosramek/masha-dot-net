const fs = require("fs-extra");
const path = require("path");

class Gen {
  pagesPath = "";
  slicesPath = "";
  buildPath = "";
  staticPath = "";
  schemaPath = "";
  constructor({ pagesPath, slicesPath, buildPath, staticPath, schemaPath }) {
    this.pagesPath = pagesPath;
    this.slicesPath = slicesPath;
    this.buildPath = buildPath;
    this.staticPath = staticPath;
    this.schemaPath = schemaPath;
  }

  loadPage(pageName) {
    return new Promise((res, rej) => {
      const filePath = path.resolve(this.pagesPath, `${pageName}.html`);
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) return rej(err);
        return res(data.trim());
      });
    });
  }
  loadSlice(sliceName) {
    return new Promise((res, rej) => {
      const filePath = path.resolve(this.slicesPath, `${sliceName}.html`);
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) return rej(err);
        return res(data.trim());
      });
    });
  }
  writeFile(fileName, data, fileType = "html") {
    return new Promise((res, rej) => {
      const filePath = path.resolve(this.buildPath, `${fileName}.${fileType}`);
      fs.writeFile(filePath, data, (err) => {
        if (err) return rej(err);
        res();
      });
    });
  }
  writePage(outputFolder, data) {
    return new Promise((res, rej) => {
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }
      const filePath = path.resolve(outputFolder, `index.html`);
      fs.writeFile(filePath, data, (err) => {
        if (err) return rej(err);
        res();
      });
    });
  }
  cleanBuild() {
    return new Promise((res, rej) => {
      fs.emptyDir(this.buildPath, (err) => {
        if (err) return rej(err);
        // replace .gitkeep file
        fs.writeFile(path.resolve(this.buildPath, ".gitkeep"), "", (err) => {
          if (err) return rej(err);
          res();
        });
      });
    });
  }
  copyOverStatic() {
    fs.copySync(this.staticPath, this.buildPath, (src, dest) => {
      if (/(\.scss|\.css\.map)$/gi.test(src)) return false;
      return true;
    });
  }
  replaceAllKeys(replacements, template) {
    let html = "" + template;
    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replaceAll(`%${key}%`, value);
    });

    return html;
  }
  loadSchema() {
    return new Promise((res, rej) => {
      fs.readFile(this.schemaPath, "utf-8", (err, data) => {
        if (err) return rej(err);
        return res(JSON.parse(data));
      });
    });
  }
}

module.exports = new Gen({
  pagesPath: path.resolve(__dirname, "..", "pages"),
  slicesPath: path.resolve(__dirname, "..", "slices"),
  staticPath: path.resolve(__dirname, "..", "static"),
  schemaPath: path.resolve(__dirname, "..", "schema", "schema.json"),
  buildPath: path.resolve(__dirname, "..", "..", "build"),
});
