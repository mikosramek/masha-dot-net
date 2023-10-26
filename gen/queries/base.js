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
        ... on NewsletterBodyEntry {
          primary {
            heading
            label
            image
          }
        }
      }
  }
}
`;
