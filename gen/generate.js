const path = require("path");
const _get = require("lodash.get");
const { MNPG } = require("@mikosramek/mnpg");

const isDev = process.env.IS_DEV === "true";
const prismicPreviewLink = process.env.PRISMIC_PREVIEW_LINK;
const insertPrismicPreviewLink =
  process.env.INSERT_PRISMIC_PREVIEW_LINK === "true";

const { basePages, entries, firstEntries } = require("./queries");

const socialsGenerator = require("./subgens/socials");
const archiveGenerator = require("./subgens/archive");
const newsletterGenerator = require("./subgens/newsletter");

const { convertToNice } = require("./utils/dates");
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
  issueNumber = 0,
  output = "",
  fetch = true,
  isSubPage = false
) => {
  if (fetch) {
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

    archives = Object.values(formattedNewsletters)
      .map((nws) => {
        const firstArticleTitle = _get(
          nws,
          "body[0].primary.heading",
          nws.title
        );
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
    socials = await socialsGenerator(_get(homePage, "socials", []));
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
  }

  // GET THE LATEST NEWSLETTER TO SHOW AS CONTENT

  let newsletter = "";
  let latestNewsletterData = {
    firstPubDate: null,
    issueNumber: "0",
  };
  if (archives[issueNumber]) {
    latestNewsletterData = formattedNewsletters[archives[issueNumber]?.slug];
    newsletter = await newsletterGenerator(latestNewsletterData);
  }

  // GEN SECTIONS
  const archive = await archiveGenerator(
    archives[issueNumber + 1] ?? null,
    archives[issueNumber - 1] ?? null
  );

  // Get and format the issue based on the last newsletter
  const issueDate = _get(latestNewsletterData, "firstPubDate", "");
  const dateString = issueDate ? convertToNice(issueDate) : "coming soon";

  const newsletterHostedFontsTemplate = await fileGen.loadSlice(
    "newsletter-hosted-fonts"
  );
  const newsletterHostedFonts = fileGen.replaceAllKeys(
    {
      "header-font-otf": _get(homePage, "header_font_otf.url", ""),
      "header-font-ttf": _get(homePage, "header_font_ttf.url", ""),
      "header-font-woff": _get(homePage, "header_font_woff.url", ""),
    },
    newsletterHostedFontsTemplate
  );

  // get web-only signup header
  const signup = await fileGen.loadSlice("web-signup");

  // get newsletter-only preview text
  const emailPreview = await fileGen.loadSlice("newsletter-preview-text");
  const emailPreviewHTML = fileGen.replaceAllKeys(
    {
      "preview-label": _get(homePage, "email_preview_text", "") ?? "",
    },
    emailPreview
  );

  const getReplacements = (mode) => ({
    // sections
    newsletter,
    socials,
    fanart: "",
    // mode specific replacements
    ...(mode === "web"
      ? {
          archive,
          unsubscribe: "",
          "newsletter-hosted-fonts": "",
          signup,
          "tag-line": _get(homePage, "tag_line", ""),
          "top-title": _get(homePage, "top_title", ""),
          "newsletter-preview": "",
        }
      : {}),
    ...(mode === "newsletter"
      ? {
          archive: "",
          unsubscribe,
          "newsletter-hosted-fonts": newsletterHostedFonts,
          signup: "",
          "newsletter-preview": emailPreviewHTML,
        }
      : {}),
    ...(isDev
      ? {
          preview: insertPrismicPreviewLink ? prismicPreviewLink : "",
        }
      : {
          preview: "",
        }),
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
  });

  let index = fileGen.replaceAllKeys(getReplacements("web"), indexTemplate);
  if (isSubPage) {
    index = index
      .replace(
        '<link rel="stylesheet" href="styles.css" />',
        '<link rel="stylesheet" href="../styles.css" />'
      )
      .replace("/favicon.ico", "../favicon.ico")
      .replaceAll("./assets", "../assets");
  }

  await fileGen.writePage(output, index);

  if (!isSubPage) {
    const newsletterHTML = fileGen.replaceAllKeys(
      getReplacements("newsletter"),
      indexTemplate
    );

    await fileGen.writePage(`${output}/newsletter/raw/`, newsletterHTML);
  }

  return latestNewsletterData.title ?? dateString;
};

const compilePages = async () => {
  for (let i = 0; i < archives.length; i += 1) {
    const slug = archives[i].slug;
    await compileIndex(i, path.resolve(fileGen.buildPath, slug), false, true);
  }
};

const compileSite = async () => {
  try {
    console.log("Cleaning Build...");
    await fileGen.cleanBuild();
    console.log("Done");

    console.log("Compiling Index...");
    const issueTitle = await compileIndex(0, fileGen.buildPath);
    console.log("Done");

    console.log("Compiling Pages...");
    await compilePages();
    console.log("Done");

    console.log("Compiling sass...");
    await compileSass();
    console.log("Done");

    console.log("Copying over /static/");
    fileGen.copyOverStatic();
    console.log("Done");

    return issueTitle;
  } catch (error) {
    console.error(error);
  }
};

module.exports = compileSite;
