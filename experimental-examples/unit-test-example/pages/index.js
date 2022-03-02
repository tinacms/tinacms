import { getStaticPropsForTina } from 'tinacms'
export default function Home(props) {
  return <pre>{JSON.stringify(props.data, null, 2)}</pre>
}

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query,
    variables: {},
  })

  return {
    props: {
      ...tinaProps,
    },
  }
}

const query = `#graphql
query GetBlockPageDocument {
  myGet: getBlockPageDocument(relativePath: "1.mdx") {
    myData: data {
      __typename
      ...BlockPageData
    }
    sys {
      filename
    }
  }
}

fragment BlockPageData on BlockPage {
  title
}
`
