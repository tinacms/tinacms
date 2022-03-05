import { Page, getStatic } from '../../components/setup'

export default Page

export const getStaticProps = () => {
  return getStatic({ query, variables })
}

const variables = {}

const query = `#graphql
query GetBlockPageDocument {
  getBlockPageDocument(relativePath: "blockPage1.mdx") {
    data {
      title
    }
  }
}
`
