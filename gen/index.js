// npm i @mikosramek/mnpg dotenv lodash.get

const path = require("path");
require("dotenv").config();

const _get = require("lodash.get");
const MNPG = require("@mikosramek/mnpg");

const IS_DEV = process.env.IS_DEV;

const { basePages } = require("./queries");

const prismicName = process.env.PRISMIC_NAME ?? "";
const secret = process.env.PRISMIC_ACCESS_TOKEN ?? "";

const Gen = require("./utils/gen-utils");

const fileGen = new Gen({
  pages: path.resolve(__dirname, "pages"),
  slices: path.resolve(__dirname, "slices"),
  static: path.resolve(__dirname, "static"),
  build: path.resolve(__dirname, "../build"),
});

const compileIndex = async () => {
  const indexTemplate = await fileGen.loadPage("index");

  // const listContainerTemplate = (
  //   await loadSlice("index-list-container")
  // ).trim();
  // const listItemTemplate = (await loadSlice("index-list-item")).trim();
  // const navItemTemplate = (await loadSlice("index-nav-item")).trim();

  const client = new MNPG.default(prismicName, secret);

  const data = await client.getBasePages(basePages);
  const homePage = _get(data, "allHomes.edges[0].node", {});
  const homeBody = _get(homePage, "body", []);

  // await writeFile("index", index);
};

const compilePages = async () => {};

const compileSite = async () => {
  console.log("Cleaning Build...");
  await cleanBuild();
  console.log("Done");
  console.log("Compiling Index...");
  await compileIndex();
  console.log("Done");

  console.log("Compiling Pages...");
  await compilePages();
  console.log("Done");

  console.log("Copying over /static/");
  copyOverStatic();
  console.log("Done");
};

compileSite();
