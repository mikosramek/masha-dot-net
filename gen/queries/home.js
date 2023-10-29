module.exports = `
  allHomes {
    edges {
      node {
        title
        header_image
        meta_share_image
        meta_site_url
        meta_short_description
        background_texture
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
