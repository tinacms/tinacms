import { Page, getStatic } from '../components/setup'

export default Page

export const getStaticProps = () => {
  return getStatic({ query, variables })
}

const variables = {}

// const query = `#graphql
// query {
//   getAuthorDocument(relativePath: "author1.mdx") {
//     data {
//       name
//       soc: social {
//         hand: handle
//       }
//     }
//     values
//     # dataJSON
//   }
// }
// `
// const query = `#graphql
// query GetBlockPageDocument {
//   getPostDocument(relativePath: "post1.mdx") {
//     data {
//       title
//       tags
//       categories
//       author {
//         ...on AuthorDocument {
//           data {
//             name
//           }
//         }
//       }
//     }
//   }
// }
// `

const query = `#graphql
query {
  getBlockPageDocument(relativePath: "blockPage1.mdx") {
    data {
      blocks {
        ...on BlockPageBlocksFeaturedPosts {
          blogs {
            item {
              ...on PostDocument {
                data {
                  title
                }
              }
            }
          }
        }
      }
    }
  }
}
`
