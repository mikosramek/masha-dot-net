const base = require("./base");
const home = require("./home");

const basePages = `
{
    ${home}
}
`;

const firstEntries = `
{
    allNewsletters (sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;

const entries = (lastId) => `
{
    allNewsletters (after: "${lastId}", first: 20, sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;

module.exports = {
  basePages,
  firstEntries,
  entries,
};
