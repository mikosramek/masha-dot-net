require("dotenv").config();
const path = require("path");
const _get = require("lodash.get");
const { MNPG } = require("@mikosramek/mnpg");

const IS_DEV = process.env.IS_DEV;

const { basePages, entries, firstEntries } = require("./queries");

const socialsGenerator = require("./subgens/socials");
const archiveGenerator = require("./subgens/archive");
const newsletterGenerator = require("./subgens/newsletter");

const { convertToNice } = require("./utils/dates");
const generateNewsletter = require("./utils/generateNewsletter");
const compileSass = require("./utils/compileScss");

const prismicName = process.env.PRISMIC_NAME ?? "";
const secret = process.env.PRISMIC_ACCESS_TOKEN ?? "";

const fileGen = require("./utils/gen-utils");

const formattedNewsletters = {};

let indexTemplate;
let metaTemplate;

let client;
let schema;

let data;
let homePage;

let bgTextureURL;

let newsletters;

let archives;
let socials;
let unsubscribe;
let meta;

const compileIndex = async (
  mode,
  issueNumber = 0,
  output = "index",
  fetch = true
) => {
  indexTemplate = await fileGen.loadPage("index");
  metaTemplate = await fileGen.loadSlice("meta");

  client = new MNPG(prismicName, secret);
  schema = await fileGen.loadSchema();

  client.createClient(schema);

  data = await client.getBasePages(basePages);
  homePage = _get(data, "allHomes.edges[0].node", {});

  bgTextureURL = _get(homePage, "background_texture.url", "");

  newsletters = await client.getEntries(
    firstEntries,
    entries,
    "allNewsletters"
  );

  newsletters.forEach((nws, index) => {
    const { _meta, title = "", body } = _get(nws, "node", {});

    const uid = _get(_meta, "uid", "");
    const firstPubDate = _get(_meta, "firstPublicationDate", "");

    if (!formattedNewsletters[uid]) {
      formattedNewsletters[uid] = {
        title,
        slug: uid,
        firstPubDate,
        body,
        issueNumber: index + 1,
      };
    }
  });

  // TODO: make sure this is sorting correctly
  // TODO: remove the latest newsletter (as it's being displayed)
  archives = Object.values(formattedNewsletters)
    .map((nws) => {
      const firstArticleTitle = _get(nws, "body[0].primary.heading", nws.title);
      return {
        title: firstArticleTitle,
        slug: nws.slug,
        firstPubDate: nws.firstPubDate,
      };
    })
    .sort((a, b) => {
      const aDate = new Date(a.firstPubDate);
      const bDate = new Date(b.firstPubDate);

      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;
      else return 0;
    });

  // GET THE LATEST NEWSLETTER TO SHOW AS CONTENT
  const latestNewsletterData = formattedNewsletters[archives[issueNumber].slug];
  const newsletter = await newsletterGenerator(latestNewsletterData);

  // GEN SECTIONS
  socials = await socialsGenerator(_get(homePage, "socials", []));
  const archive = await archiveGenerator(
    archives[issueNumber + 1] ?? null,
    archives[issueNumber - 1] ?? null
  );
  unsubscribe = await fileGen.loadSlice("unsubscribe");

  // GEN META
  meta = fileGen.replaceAllKeys(
    {
      title: homePage.title,
      "share-image-url": _get(homePage, "meta_share_image.url", ""),
      "short-description": _get(homePage, "meta_short_description", ""),
      "site-url": _get(homePage, "meta_site_url", ""),
    },
    metaTemplate
  );

  // Get and format the issue based on the last newsletter
  const issueDate = _get(latestNewsletterData, "firstPubDate", "");
  const dateString = convertToNice(issueDate);

  const index = fileGen.replaceAllKeys(
    {
      // sections
      newsletter,
      socials,
      fanart: "",
      // mode specific replacements
      ...(mode === "web"
        ? {
            archive,
            unsubscribe: "",
            header: "TODO",
          }
        : {}),
      ...(mode === "newsletter"
        ? {
            archive: "",
            unsubscribe,
            header: "",
          }
        : {}),
      // small piece replacements
      title: homePage.title,
      header_image: _get(
        homePage,
        "header_image.url",
        "./assets/title_graphic.png"
      ),
      "site-title": homePage.title,
      "meta-tags": meta,
      "publish-date": dateString,
      "issue-number": `#${latestNewsletterData.issueNumber}`,
      bgTextureURL,
    },
    indexTemplate
  );

  await fileGen.writeFile(output, index);
};

const compilePages = async () => {
  // get list of all newsletters
  // create subpages
  // /slug/index.html
  // use first image as meta image
  // use first heading as short-description
};

const compileSite = async () => {
  const [_, __, mode = "web"] = process.argv;

  console.log(`*** Building in ${mode} mode`);

  try {
    console.log("Cleaning Build...");
    await fileGen.cleanBuild();
    console.log("Done");

    console.log("Compiling Index...");
    await compileIndex(mode);
    console.log("Done");

    if (mode === "web") {
      console.log("Compiling Pages...");
      await compilePages();
      console.log("Done");
    }

    console.log("Compiling sass...");
    await compileSass();
    console.log("Done");

    console.log("Copying over /static/");
    fileGen.copyOverStatic();
    console.log("Done");

    if (mode === "newsletter") {
      console.log("Compiling newsletter...");
      await generateNewsletter(
        path.resolve(fileGen.buildPath, "index.html"),
        path.resolve(fileGen.buildPath, "styles.css"),
        path.resolve(fileGen.buildPath, "newsletter.html")
      );
      console.log("Done");
    }
  } catch (error) {
    console.error(error);
  }
};

compileSite();
