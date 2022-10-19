import { InferGetStaticPropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../.tina/__generated__/client'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  return (
    <div
      data-test="rich-text-body"
      className="mx-4 border rounded-lg p-8 shadow-lg prose"
    >
      <TinaMarkdown content={data.post.body} />
    </div>
  )
}

export const getStaticProps = async () => {
  const variables = { relativePath: `tinacms-v0.69.7.md` }
  const props = await client.queries.post(variables)
  return {
    props: { ...props, variables },
  }
}
