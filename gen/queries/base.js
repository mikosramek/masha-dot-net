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
      body {
        ... on NewsletterBodyImage {
          fields {
            image
          }
        }
        ... on NewsletterBodyText {
          fields {
            paragraph
          }
        }
        ... on NewsletterBodyHeading {
          primary {
            heading
          }
        }
      }
  }
}
`;
