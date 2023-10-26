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
        __typename
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
