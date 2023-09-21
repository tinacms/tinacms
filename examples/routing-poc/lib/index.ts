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

type PageResult = Awaited<
  Promise<ReturnType<(typeof client)['queries']['page']>>
>
type PageResultData = PageResult['data']
type PageResultDataPage = PageResult['data']['page']
export type PageResultWithActiveVersion = PageResult & {
  data: PageResultData & {
    page: PageResultDataPage & { activeVersion?: string }
  }
}

const findDeepestSidebar = async ({
  slug,
}: {
  slug: string[]
}): Promise<PageResultWithActiveVersion> => {
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
    const nextSlug = slug.slice(0, slug.length - 1)
    const result = await findDeepestSidebar({
      slug: nextSlug,
    })
    if (result.data.page.__typename === 'PageVersionedSidebar') {
      return {
        ...result,
        data: {
          ...result.data,
          page: {
            ...result.data.page,
            activeVersion: slug.at(
              result.data.page._sys.breadcrumbs.length - 1
            ),
          },
        },
      }
    } else {
      return result
    }
  }
}

export const findSidebarAncestry = async (
  slug: string[],
  accumulator: PageResultWithActiveVersion[] = []
): Promise<PageResultWithActiveVersion[]> => {
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
