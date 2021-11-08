import { getStaticPropsForTina } from 'tinacms'
export default function Home(props) {
  return (
    <div>
      <code>
        <pre>{JSON.stringify(props.data.getPostDocument.data, null, 2)}</pre>
      </code>
    </div>
  )
}

export const getStaticPaths = async () => {
  const tinaProps = await getStaticPropsForTina({
    query: `{
        getPageList{
          edges {
            node {
              sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  })
  const paths = tinaProps.data.getPageList.edges.map((x) => {
    console.log({ x: x.node.sys })
    return { params: { slug: x.node.sys.filename } }
  })

  console.log(paths)

  return {
    paths,
    fallback: 'blocking',
  }
}
export const getStaticProps = async (ctx) => {
  console.log({ ctx })
  const tinaProps = await getStaticPropsForTina({
    query: `query getPost($relativePath: String!) {
        getPostDocument(relativePath: $relativePath) {
          data {
            title
            body
          }
        }
      }
      `,
    variables: {
      relativePath: ctx.params.slug + '.md',
    },
  })

  return {
    props: {
      ...tinaProps,
    },
  }
}
