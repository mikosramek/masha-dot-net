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
        tag_line
        top_title
        header_font_otf {
          ... on _FileLink {
            url
          }
        }
        header_font_woff {
          ... on _FileLink {
            url
          }
        }
        header_font_ttf {
          ... on _FileLink {
            url
          }
        }
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
