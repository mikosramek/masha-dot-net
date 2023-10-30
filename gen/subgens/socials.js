const _get = require("lodash.get");
const fileGen = require("../utils/gen-utils");

const genSocials = async (socialData) => {
  const wrapperTemplate = await fileGen.loadSlice("socials-wrapper");
  const socialTemplate = await fileGen.loadSlice("socials");

  let socials = [];

  socialData.forEach((social, index) => {
    const replacements = {
      link: _get(social, "link.url", ""),
      icon: _get(social, "icon.url", ""),
      label: _get(social, "icon.alt", ""),
    };

    let socialHTML = fileGen.replaceAllKeys(replacements, socialTemplate);
    index % 2 === 0
      ? (socialHTML = `<tr>${socialHTML}`)
      : (socialHTML = `${socialHTML}</tr>`);

    socials.push(socialHTML);
  });

  return fileGen.replaceAllKeys(
    {
      socials: socials.join("\n"),
    },
    wrapperTemplate
  );
};

module.exports = genSocials;
