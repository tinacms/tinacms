import { ExperimentalGetTinaClient } from '../.tina/__generated__/types'
import { GetStaticProps, GetStaticPaths } from 'next'
import { fileToUrl } from 'utils/urls'
import { useTina } from 'tinacms/dist/edit-state'
import { BlocksPage } from 'components/blocks/BlocksPage'

const fg = require('fast-glob')

const Page = (props) => {
  const tinaData = useTina({
    query: props.query,
    data: props.data,
    variables: props.vars,
  })
  const data = tinaData.data.getPageDocument.data

  return <BlocksPage data={data} />
}

// Data Fetching
export const getStaticProps: GetStaticProps = async function ({
  preview,
  previewData,
  ...ctx
}) {
  const { slug } = ctx.params
  const client = ExperimentalGetTinaClient()
  const vars = { relativePath: slug + '.json' }
  const res = await client.getPageDocument(vars)

  return {
    props: {
      query: res.query,
      data: res.data,
      vars,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async function () {
  const pages = await fg(`./content/blocksPages/*.json`)
  const paths = pages.map((file) => {
    const slug = fileToUrl(file, 'blocksPages')
    return { params: { slug } }
  })
  const updatedPaths = paths.filter((path) => {
    return path.params.slug !== 'home'
  })
  return {
    paths: updatedPaths,
    fallback: false,
  }
}

export default Page
