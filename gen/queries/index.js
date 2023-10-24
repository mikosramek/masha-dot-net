const base = require("./base");
const home = require("./home");

const basePages = `
{
    ${home}
}
`;

const firstEntries = `
{
    allPages (sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;

const entries = (lastId, pageCount = 20) => `
{
    allPages (after: "${lastId}", first: ${pageCount}, sortBy:meta_firstPublicationDate_ASC) {
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
