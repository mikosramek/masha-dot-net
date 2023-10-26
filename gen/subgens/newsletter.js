// formattedNewsletters
const _get = require("lodash.get");
const fileGen = require("../utils/gen-utils");

let paragpraphTemplate, headingTemplate, imageTemplate;

/*
{
  "fields": [
    {
      "paragraph": "Here is some text about mawa, this won't respect new lines really?\nI mean it might."
    },
    {
      "paragraph": "But here is a larger space break :)"
    }
  ]
}
*/
const genParagraphSlice = (slice) => {
  return "paragpraph";
};

/*
{
  "primary": {
    "heading": "Haha she funny"
  }
}
*/
const genHeadingSlice = (slice) => {
  const heading = _get(slice, "primary.heading", "");
  return fileGen.replaceAllKeys({ heading }, headingTemplate);
};

/*
{
  "fields": [
    {
      "image": {
        "dimensions": {
          "width": 950,
          "height": 950
        },
        "alt": "Masha stares down a stuffed duck from Spirited Away",
        "copyright": null,
        "url": "https://images.prismic.io/masha-dot-net/90392e75-fd0a-4564-8c25-567bd84e732c_masha-and-duck.jpg?auto=compress,format&rect=0,526,996,996&w=950&h=950"
      }
    }
  ]
}
*/
const genImageSlice = (slice) => {
  return "image";
};

const genSlices = (slices) => {
  const html = slices.map((slice) => {
    const type = _get(slice, "__typename", "");
    switch (type) {
      case "NewsletterBodyImage":
        return genImageSlice(slice);
      case "NewsletterBodyHeading":
        return genHeadingSlice(slice);
      case "NewsletterBodyText":
        return genParagraphSlice(slice);
      default:
        console.error(`slice type of "${type}" is not handled`);
    }
  });

  return html.join("\n");
};

const genNewsletter = async (newsletter) => {
  const html = await fileGen.loadSlice("newsletter");

  headingTemplate = await fileGen.loadSlice("newsletter-heading");
  paragpraphTemplate = await fileGen.loadSlice("newsletter-paragraph");
  imageTemplate = await fileGen.loadSlice("newsletter-image");

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
    slices: genSlices(body),
  };

  return fileGen.replaceAllKeys(replacements, html);
};

module.exports = genNewsletter;
