const _get = require("lodash.get");
const fileGen = require("../utils/gen-utils");
const { convertToNice } = require("../utils/dates");

const genArchive = async (previous, next) => {
  console.log(previous, next);

  const archiveWrapper = await fileGen.loadSlice("archive-wrapper");
  const archiveLink = await fileGen.loadSlice("archive-link");
  const placeholder = await fileGen.loadSlice("archive-placeholder");

  const links = [];
  if (previous) {
    const label = convertToNice(_get(previous, "firstPubDate", ""));
    const slug = _get(previous, "slug", "");
    links.push(
      fileGen.replaceAllKeys(
        {
          label,
          slug,
        },
        archiveLink
      )
    );
  } else {
    links.push(placeholder);
  }
  if (next) {
    const label = convertToNice(_get(next, "firstPubDate", ""));
    const slug = _get(previous, "slug", "");
    links.push(
      fileGen.replaceAllKeys(
        {
          label,
          slug,
        },
        archiveLink
      )
    );
  } else {
    links.push(placeholder);
  }

  return fileGen.replaceAllKeys(
    {
      links: links.join("\n"),
    },
    archiveWrapper
  );
};

module.exports = genArchive;
