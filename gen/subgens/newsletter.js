// formattedNewsletters
const _get = require("lodash.get");
const fileGen = require("../utils/gen-utils");

let entryTemplate;

/*
{
  "__typename": "NewsletterBodyEntry",
  "primary": {
    "heading": "Spooky :(",
    "label": "Is that real?!",
    "image": {
      "dimensions": {
        "width": 950,
        "height": 950
      },
      "alt": "Masha stands in the hallway menacingly",
      "copyright": null,
      "url": "https://images.prismic.io/masha-dot-net/9a7b74ac-ce63-4b42-9105-2dea08840307_mawa.jpg?auto=compress,format&rect=699,930,653,653&w=950&h=950"
    }
  }
}
*/
const genEntry = (slice) => {
  return fileGen.replaceAllKeys(
    {
      heading: _get(slice, "primary.heading", ""),
      label: _get(slice, "primary.label", ""),
      "img-url": _get(slice, "primary.image.url", ""),
      "img-alt": _get(slice, "primary.image.alt", ""),
    },
    entryTemplate
  );
};

const genSlices = (slices) => {
  const html = slices.map((slice) => {
    const type = _get(slice, "__typename", "");
    switch (type) {
      case "NewsletterBodyEntry":
        return genEntry(slice);
      default:
        console.error(`slice type of "${type}" is not handled`);
    }
  });

  return html.join("\n");
};

const genNewsletter = async (newsletter) => {
  const html = await fileGen.loadSlice("newsletter");

  entryTemplate = await fileGen.loadSlice("newsletter-entry");

  /*
    'masha-at-the-zoo': {
      title: 'Masha visits the zoo',
      slug: 'masha-at-the-zoo',
      firstPubDate: '2023-10-26T11:49:31+0000',
      body: [ [Object], [Object], [Object] ]
    }
  */

  const body = _get(newsletter, "body", []);

  const replacements = {
    title: _get(newsletter, "title", ""),
    entries: genSlices(body),
  };

  return fileGen.replaceAllKeys(replacements, html);
};

module.exports = genNewsletter;
