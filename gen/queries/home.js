module.exports = `
allHomes {
  edges {
    node {
      description
      body {
        ... on HomeBodyZone {
          type
          primary {
            name
          }
          fields {
            page_link {
              ... on Page {
                heading
                _meta {
                  id
                  uid
                }
                header_image
              }
            }
          }
        }
      }
    }
  }
  }
`;
