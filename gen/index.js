// npm i @mikosramek/mnpg dotenv lodash.get fs-extra

const path = require("path");
require("dotenv").config();

const _get = require("lodash.get");
const MNPG = require("@mikosramek/mnpg");

const IS_DEV = process.env.IS_DEV;

const { basePages, entries, firstEntries } = require("./queries");

const socialsGenerator = require("./subgens/socials");
const archiveGenerator = require("./subgens/archive");
const newsletterGenerator = require("./subgens/newsletter");

const prismicName = process.env.PRISMIC_NAME ?? "";
const secret = process.env.PRISMIC_ACCESS_TOKEN ?? "";

const fileGen = require("./utils/gen-utils");

// const fileGen = new Gen({
//   pagesPath: path.resolve(__dirname, "pages"),
//   slicesPath: path.resolve(__dirname, "slices"),
//   staticPath: path.resolve(__dirname, "static"),
//   buildPath: path.resolve(__dirname, "../build"),
// });

const formattedNewsletters = {};

const compileIndex = async () => {
  const indexTemplate = await fileGen.loadPage("index");
  const metaTemplate = await fileGen.loadSlice("meta");

  // const listContainerTemplate = (
  //   await loadSlice("index-list-container")
  // ).trim();
  // const listItemTemplate = (await loadSlice("index-list-item")).trim();
  // const navItemTemplate = (await loadSlice("index-nav-item")).trim();

  const client = new MNPG.default(prismicName, secret);

  const data = await client.getBasePages(basePages);
  const homePage = _get(data, "allHomes.edges[0].node", {});
  // const homeBody = _get(homePage, "body", []);

  const newsletters = await client.getEntries(
    firstEntries,
    entries,
    "allNewsletters"
  );

  newsletters.forEach((nws) => {
    const { _meta, title = "", body } = _get(nws, "node", {});

    const uid = _get(_meta, "uid", "");
    const firstPubDate = _get(_meta, "firstPublicationDate", "");

    if (!formattedNewsletters[uid]) {
      formattedNewsletters[uid] = {
        title,
        slug: uid,
        firstPubDate,
        body,
      };
    }
  });

  // TODO: make sure this is sorting correctly
  // TODO: remove the latest newsletter (as it's being displayed)
  const archives = Object.values(formattedNewsletters)
    .map((nws) => {
      return {
        title: nws.title,
        slug: nws.slug,
        firstPubDate: nws.firstPubDate,
      };
    })
    .sort((a, b) => {
      const aDate = new Date(a.firstPubDate);
      const bDate = new Date(b.firstPubDate);

      if (aDate > bDate) return 1;
      if (aDate < bDate) return -1;
      else return 0;
    });

  const latestNewsletter = await newsletterGenerator(
    formattedNewsletters[archives[0].slug]
  );

  const socials = await socialsGenerator(_get(homePage, "socials", []));

  const archive = await archiveGenerator(archives);

  const meta = fileGen.replaceAllKeys(
    {
      title: homePage.title,
      "share-image-url": _get(homePage, "meta_share_image.url", ""),
    },
    metaTemplate
  );

  const index = fileGen.replaceAllKeys(
    {
      title: homePage.title,
      "site-title": homePage.title,
      "meta-tags": meta,
      socials,
      archive,
      newsletter: latestNewsletter,
    },
    indexTemplate
  );

  await fileGen.writeFile("index", index);
};

const compilePages = async () => {
  // get list of all newsletters
  // create subpages
  // /slug/index.html
};

const compileSite = async () => {
  console.log("Cleaning Build...");
  await fileGen.cleanBuild();
  console.log("Done");
  console.log("Compiling Index...");
  await compileIndex();
  console.log("Done");

  console.log("Compiling Pages...");
  await compilePages();
  console.log("Done");

  console.log("Copying over /static/");
  fileGen.copyOverStatic();
  console.log("Done");
};

compileSite();
