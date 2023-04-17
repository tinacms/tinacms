import React from 'react'
import { InferGetStaticPropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../tina/__generated__/client'
import { expandWithMetadata } from '@tinacms/preview-helpers'
import {
  previewField,
  useEditOpen,
  useEditDemo,
} from '@tinacms/preview-helpers/dist/react'

// export default function Home(
//   props: InferGetStaticPropsType<typeof getStaticProps>
// ) {
//   const { data } = useTina(props)
//   useEditOpen("/admin")
//   useEditDemo()
//   return <div className='mx-auto max-w-4xl p-4 shadow-lg rounded-md'>
//     <h1 data-vercel-edit-info={previewField(data.documentation, 'title')}>{data.documentation.title}</h1>
//   </div>
//   // return <Json src={data} />
// }

// export const getStaticProps = async ({ params }) => {
//   const variables = { relativePath: `${params.filename}.md` }
//   let props = await client.queries.documentation(variables)

//   // if (process.env.VERCEL_ENV === 'preview') {
//   props = await expandWithMetadata(props, client)
//   // }
//   return {
//     props: { ...props, variables },
//   }
// }

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  useEditOpen('/admin')
  useEditDemo()

  return (
    <div>
      {/* <ClientLoadExample /> */}
      {data.page.__typename === 'PageBlockPage'
        ? data.page.blocks.map((block) => {
            if (block.__typename === 'PageBlockPageBlocksFeatures') {
              return (
                <div className="mx-auto max-w-5xl p-8 rounded-lg shadow-md">
                  {block.imageList?.map((item, index) => {
                    return (
                      <img
                        data-vercel-edit-info={previewField(
                          block,
                          'imageList',
                          index
                        )}
                        src={item}
                      />
                    )
                  })}
                </div>
              )
            } else if (block.__typename === 'PageBlockPageBlocksHero') {
              return (
                <div className="mx-auto max-w-5xl p-8 rounded-lg shadow-md">
                  <h3 data-vercel-edit-info={previewField(block, 'headline')}>
                    {block.headline}
                  </h3>
                  <p data-vercel-edit-info={previewField(block, 'description')}>
                    {block.description}
                  </p>
                  <div className="flex gap-2">
                    {block.actions.map((action) => {
                      if (
                        action.__typename === 'PageBlockPageBlocksHeroActions'
                      ) {
                        return (
                          <button data-vercel-edit-info={previewField(action)}>
                            {action.label}
                          </button>
                        )
                      }
                    })}
                  </div>
                </div>
              )
            }
            return <div></div>
          })
        : null}
      <Json src={data} />
    </div>
  )
}

const ClientLoadExample = () => {
  const [payload, setPayload] = React.useState()
  const [showAuthor, setShowAuthor] = React.useState(false)

  React.useEffect(() => {
    client.queries.author({ relativePath: 'pedro.md' }).then((res) => {
      setPayload(res)
    })
  }, [])
  if (!showAuthor) {
    return (
      <button
        type="button"
        onClick={() => {
          setShowAuthor((showAuthor) => !showAuthor)
        }}
      >
        Toggle Author
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowAuthor((showAuthor) => !showAuthor)}
      >
        Toggle Author
      </button>
      <ClientLoadAuthor {...payload} />
    </div>
  )
}

const ClientLoadAuthor = (props) => {
  const { data } = useTina(props)
  return <Json src={data} />
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  let props = await client.queries.page(variables)
  props = await expandWithMetadata(props, client)
  return {
    props: { ...props, variables },
  }
}

export const getStaticPaths = async () => {
  const connection = await client.queries.pageConnection()
  return {
    paths: connection.data.pageConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}
