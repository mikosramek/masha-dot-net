module.exports = `
  allHomes {
    edges {
      node {
        title
        meta_share_image
        meta_site_url
        meta_short_description
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
