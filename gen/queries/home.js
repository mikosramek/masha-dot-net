module.exports = `
  allHomes {
    edges {
      node {
        title
        meta_share_image
        socials {
          icon
          link {
            ... on _ExternalLink {
              url
            }
          }
        }
        unsubscribe_text
        unsubscribe_link {
          ... on _ExternalLink {
            url
          }
        }
      }
    }
  }
`;
