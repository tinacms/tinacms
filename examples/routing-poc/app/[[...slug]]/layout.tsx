import { Layout } from '@/components/layout'
import { client } from '@/tina/__generated__/client'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
  children,
}: {
  params: { slug: string[] }
  children: React.ReactNode
}) {
  const result = await findDeepestOverview({
    slug: params.slug || [],
  })
  let parent
  try {
    const parentSlug =
      result.data.page._sys.breadcrumbs.slice(
        0,
        result.data.page._sys.breadcrumbs?.length - 2
      ) || []
    parent = await findDeepestOverview({
      slug: parentSlug,
    })
  } catch (e) {}
  if (result.data.page.__typename !== 'PageOverview') {
    throw new Error('Expected overview document to be of overview template')
  }
  return (
    <Layout result={result} parent={parent}>
      {children}
    </Layout>
  )
}

const findDeepestOverview = async ({
  slug,
}: {
  slug: string[]
}): Promise<ReturnType<(typeof client)['queries']['page']>> => {
  let path
  try {
    path = `${[...slug, '_overview'].join('/')}.mdx`
    const result = await client.queries.page({
      relativePath: path,
    })
    return result
  } catch (e) {
    if (slug.length === 0) {
      throw new Error(`Unable to find any ToC`)
    }
    return findDeepestOverview({
      slug: slug.slice(0, slug.length - 1),
    })
  }
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
