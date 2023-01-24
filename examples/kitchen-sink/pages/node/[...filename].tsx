import { InferGetServerSidePropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../tina/__generated__/client'

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { data } = useTina(props)

  return <Json src={data} />
}

export const getServerSideProps = async ({ params }) => {
  const variables = { id: `${params.filename.join('/')}.md` }
  const props = await client.queries.NodeQuery(variables)
  return {
    props: { ...props, variables },
  }
}
