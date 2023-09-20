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
  const versions = await findVersions({ slugs: params.slug || [] })
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
    <Layout result={result} versions={versions} parent={parent}>
      {children}
    </Layout>
  )
}

const findVersions = async ({ slugs }: { slugs: string[] }): Promise<any> => {
  let path = slugs.join('/')
  const versions = (
    await client.queries.pageConnection({
      filter: {
        version_meta: {
          typename: {
            // TODO - Search on filename instead of typename once we have that capability
            in: ['version_meta'],
          },
        },
      },
    })
  ).data.pageConnection.edges?.filter((edge) => {
    return slugs
      .join('/')
      .startsWith(
        edge!.node!._sys.relativePath!.replace('/version-meta.mdx', '')
      )
  })

  if (!versions?.length) {
    return []
  }

  const latestBranch = versions![versions!.length - 1]!
  const versionRoot = latestBranch.node!._sys.relativePath!.replace(
    '/version-meta.mdx',
    ''
  )

  const currentVersionContext = path.split(versionRoot)[1].split('/')[1]

  const branches = (
    versions!.length > 0 ? versions![versions!.length - 1]!.node!.version : []
  ).map((branch) => {
    console.log('branch', branch)
    console.log('currentVersionContext', currentVersionContext)

    return {
      name: branch,
      id: branch,
      selected: branch === currentVersionContext,
      url: `/${versionRoot}/${branch}`,
    }
  })

  return branches
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
