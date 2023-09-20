import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { client } from '@/tina/__generated__/client'
import { PageQuery } from '@/tina/__generated__/types'
import { Layout } from '@/components/layout'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { slug: string[] } }) {
  const result = await findItem(params)
  const result3 = await findSidebarAncestors({ slug: params.slug || [] })
  if (result.data.page.__typename !== 'PageOverview') {
    throw new Error('Expected overview document to be of overview template')
  }
  // console.log('result3', result3[0].data.page.id)
  const currentSidebar = result3[0]
  if (currentSidebar) {
    if (currentSidebar.data.page.__typename === 'PageOverview') {
      if (currentSidebar.data.page.versionedSidebar) {
        if (currentSidebar.data.page.id === result.data.page.id) {
          // were on a versioned sidebar page, we should redirect to the
          // first version found
          const latestVersion =
            currentSidebar.data.page.versionedSidebar.versions[0]
          console.log('it me', latestVersion.name)
          // redirect()
        }
      }
    }
  }

  return (
    <Layout result={result3[0]} versions={[]}>
      <article className="prose lg:prose-sm m-auto">
        <TinaMarkdown components={{}} content={result.data.page.body} />
      </article>
    </Layout>
  )
}

const findItem = async ({
  slug,
}: {
  slug: string[]
}): Promise<ReturnType<(typeof client)['queries']['page']>> => {
  try {
    try {
      const relativePath = `${slug.join('/')}.mdx`
      // const relativePath = `en/pixyz/_overview.mdx`
      const result = await client.queries.page({
        relativePath,
      })
      return result
    } catch (e) {
      const relativePath = `${[...slug, '_overview'].join('/')}.mdx`
      const result = await client.queries.page({
        relativePath,
      })
      return result
    }
  } catch (e) {
    // if (slug.length === 0) {
    throw new Error(`Unable to find any item ${slug.join('/')}`)
    // }
    // return findItem({
    //   slug: slug.slice(0, slug.length - 1),
    // })
  }
}

const findDeepestSidebar = async ({
  slug,
}: {
  slug: string[]
}): Promise<ReturnType<(typeof client)['queries']['page']>> => {
  let path
  try {
    path = `${[...slug, '_sidebar'].join('/')}.mdx`
    const result = await client.queries.page({
      relativePath: path,
    })
    return result
  } catch (e) {
    if (slug.length === 0) {
      throw new Error(`Unable to find any ToC. Path ${path}`)
    }
    return findDeepestSidebar({
      slug: slug.slice(0, slug.length - 1),
    })
  }
}

const findSidebarAncestors = async ({
  slug,
  accumulator = [],
}: {
  slug: string[]
  accumulator: { data: PageQuery }[]
}) => {
  try {
    const result = await findDeepestSidebar({
      slug: slug || [],
    })
    accumulator.push(result)
    const parentSlug =
      result.data.page._sys.breadcrumbs.slice(
        0,
        result.data.page._sys.breadcrumbs?.length - 2
      ) || []
    if (parentSlug.length > 0) {
      await findSidebarAncestors({ slug: parentSlug, accumulator })
    }
    return accumulator
  } catch (e) {
    return accumulator
  }
}
