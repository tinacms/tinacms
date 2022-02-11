import { staticRequest } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
import { useTina } from 'tinacms/dist/edit-state'
import { FeaturedBlogs } from '../components/featured-blog'

const query = `{
  getPageDocument(relativePath: "home.mdx") {
    id
    data {
      blocks {
        __typename
        ...on PageBlocksFeaturedBlogs {
          headline
          text
          blogs {
            blog {
              __typename
              ...on PostDocument {
                data {
                  title
                  topic
                  image
                  author {
                    ...on AuthorDocument {
                      data {
                        name
                        avatar
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`

export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

  const content = data.getPageDocument.data.body
  return (
    <Layout>
      {/* <TinaMarkdown content={content} /> */}
      {data.getPageDocument.data.blocks.map((block) => {
        if (!block) {
          return null
        }
        // return <FeaturedBlogs {...block} />
        switch (block.__typename) {
          case 'PageBlocksFeaturedBlogs':
            return <FeaturedBlogs {...block} />
          default:
            break
        }
      })}
    </Layout>
  )
}

export const getStaticProps = async () => {
  const variables = {}
  let data = {}
  try {
    data = await staticRequest({
      query,
      variables,
    })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
