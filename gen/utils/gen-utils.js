const fs = require("fs-extra");
const path = require("path");

class Gen {
  pagesPath = "";
  slicesPath = "";
  buildPath = "";
  staticPath = "";
  Gen({ pages, slices, build, static }) {
    this.pagesPath = pages;
    this.slicesPath = slices;
    this.buildPath = build;
    this.static = static;
  }

  loadPage(pageName) {
    return new Promise((res, rej) => {
      const filePath = path.resolve(this.pagesPath, `${pageName}.html`);
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) return rej(err);
        return res(data).trim();
      });
    });
  }
  loadSlice(sliceName) {
    return new Promise((res, rej) => {
      const filePath = path.resolve(this.slicesPath, `${sliceName}.html`);
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) return rej(err);
        return res(data).trim();
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
        res();
      });
    });
  }
  copyOverStatic() {
    fs.copySync(this.staticPath, this.buildPath, (src, dest) => {
      if (/(\.scss|\.css\.map)$/gi.test(src)) return false;
      return true;
    });
  }
}

module.exports = Gen;
