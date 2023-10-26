const fs = require("fs-extra");
const path = require("path");

class Gen {
  pagesPath = "";
  slicesPath = "";
  buildPath = "";
  staticPath = "";
  constructor({ pagesPath, slicesPath, buildPath, staticPath }) {
    this.pagesPath = pagesPath;
    this.slicesPath = slicesPath;
    this.buildPath = buildPath;
    this.staticPath = staticPath;
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
  writeFile(fileName, data) {
    return new Promise((res, rej) => {
      const filePath = path.resolve(this.buildPath, `${fileName}.html`);
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
}

module.exports = Gen;
