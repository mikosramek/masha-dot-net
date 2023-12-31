module.exports = `
edges {
  cursor
  node {
      _meta {
          id
          uid
          tags
          lastPublicationDate
          firstPublicationDate
      }
      title
      email_preview_text
      body {
        __typename
        ... on NewsletterBodyEntry {
          primary {
            heading
            label
            image
          }
        }
        ... on NewsletterBodyFan_art {
          fields {
            fan_art
            label
            link {
              ... on _ExternalLink {
                url
              }
            }
          }
        }
      }
  }
}
`;
