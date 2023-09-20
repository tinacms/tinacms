import { client } from '@/tina/__generated__/client'
import { PageQuery } from '@/tina/__generated__/types'

export const findPageOrOverview = async (slug: string[]) => {
  try {
    const page = await client.queries.page({
      relativePath: `${slug.join('/')}.mdx`,
    })
    return page
  } catch (e) {
    try {
      const page = await client.queries.page({
        relativePath: `${[...slug, '_overview'].join('/')}.mdx`,
      })
      return page
    } catch (e) {
      throw new Error(
        `Unable to find overview fall back page for ${slug.join('/')}`
      )
    }
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

export const findSidebarAncestry = async (
  slug: string[],
  accumulator: { data: PageQuery }[] = []
) => {
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
      await findSidebarAncestry(parentSlug, accumulator)
    }
    return accumulator
  } catch (e) {
    return accumulator
  }
}