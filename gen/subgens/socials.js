const _get = require("lodash.get");

const genSocials = async (fileGen, socialData) => {
  const wrapperTemplate = await fileGen.loadSlice("socials-wrapper");
  const socialTemplate = await fileGen.loadSlice("socials");

  let socials = [];

  socialData.forEach((social) => {
    const replacements = {
      link: _get(social, "link.url", ""),
      icon: _get(social, "icon.url", ""),
      label: _get(social, "icon.alt", ""),
    };
    socials.push(fileGen.replaceAllKeys(replacements, socialTemplate));
  });

  return fileGen.replaceAllKeys(
    {
      socials: socials.join("\n"),
    },
    wrapperTemplate
  );
};

module.exports = genSocials;
