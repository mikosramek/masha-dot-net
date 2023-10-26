const _get = require("lodash.get");

const genArchive = async (fileGen, archiveData) => {
  const wrapperTemplate = await fileGen.loadSlice("archive-wrapper");
  const archiveTemplate = await fileGen.loadSlice("archive");

  let archiveLinks = [];

  archiveData.forEach((archive) => {
    const replacements = {
      slug: _get(archive, "slug", ""),
      label: _get(archive, "title", ""),
    };
    archiveLinks.push(fileGen.replaceAllKeys(replacements, archiveTemplate));
  });

  return fileGen.replaceAllKeys(
    {
      archives: archiveLinks.join("\n"),
    },
    wrapperTemplate
  );
};

module.exports = genArchive;
