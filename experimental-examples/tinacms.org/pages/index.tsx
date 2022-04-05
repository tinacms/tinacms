import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import { useTina } from 'tinacms/dist/edit-state'
import { BlocksPage } from 'components/blocks/BlocksPage'

const HomePage = (props) => {
  const tinaData = useTina({
    query: props.query,
    data: props.data,
    variables: props.vars,
  })
  const data = tinaData.data.getPageDocument.data

  return <BlocksPage data={data} />
}

// Data Fetching
export const getStaticProps = async function () {
  const client = ExperimentalGetTinaClient()
  const vars = { relativePath: 'home.json' }
  const res = await client.getPageDocument(vars)
  return {
    props: {
      query: res.query,
      data: res.data,
      vars,
    },
  }
}

export default HomePage
