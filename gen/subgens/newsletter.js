// formattedNewsletters
const _get = require("lodash.get");
const fileGen = require("../utils/gen-utils");

let entryTemplate;
let fanArtTemplate;
let fanArtWrapper;

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

/*
{
  fields: [
    {
      fan_art: [Object],
      label: '@PigeonMasha_',
      link: [Object],
      __typename: 'NewsletterBodyFan_artFields'
    }
  ]
}
*/
const genFanArt = (slices) => {
  const art = slices.map((section) => {
    const artHTML = section.fields.map((slice, index) => {
      const url = _get(slice, "fan_art.url", "");
      const alt = _get(slice, "fan_art.alt", "");
      const label = _get(slice, "label", "");
      const link = _get(slice, "link.url", "");
      let fanArtHTML = fileGen.replaceAllKeys(
        {
          url,
          alt,
          label,
          link,
        },
        fanArtTemplate
      );

      if (slices.length > 1) {
        index % 2 === 0
          ? (fanArtHTML = `<tr>${fanArtHTML}`)
          : (fanArtHTML = `${fanArtHTML}</tr>`);
      } else {
        fanArtHTML = `<tr>${fanArtHTML}</tr>`;
      }

      return fanArtHTML;
    });

    return fileGen.replaceAllKeys(
      {
        art: artHTML.join("\n"),
      },
      fanArtWrapper
    );
  });

  return art.join("\n");
};

const genSlices = (slices) => {
  const entrySlices = [];
  const fanArtSlices = [];

  slices.forEach((slice) => {
    const type = _get(slice, "__typename", "");
    switch (type) {
      case "NewsletterBodyEntry":
        entrySlices.push(slice);
        break;
      case "NewsletterBodyFan_art":
        fanArtSlices.push(slice);
        break;
      default:
        console.error(`slice type of "${type}" is not handled`);
        break;
    }
  });

  const parts = {};

  parts.entries = entrySlices.map(genEntry).join("\n");
  parts.fanArt = genFanArt(fanArtSlices);

  return parts;
};

const genNewsletter = async (newsletter) => {
  const html = await fileGen.loadSlice("newsletter");

  entryTemplate = await fileGen.loadSlice("newsletter-entry");
  fanArtTemplate = await fileGen.loadSlice("fan-art");
  fanArtWrapper = await fileGen.loadSlice("fan-art-wrapper");

  /*
    'masha-at-the-zoo': {
      title: 'Masha visits the zoo',
      slug: 'masha-at-the-zoo',
      firstPubDate: '2023-10-26T11:49:31+0000',
      body: [ [Object], [Object], [Object] ]
    }
  */

  const body = _get(newsletter, "body", []);

  const { entries, fanArt } = genSlices(body);

  const replacements = {
    title: _get(newsletter, "title", ""),
    entries,
    "fan-art": fanArt,
  };

  return fileGen.replaceAllKeys(replacements, html);
};

module.exports = genNewsletter;
