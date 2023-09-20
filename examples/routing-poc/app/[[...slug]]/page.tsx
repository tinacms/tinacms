import { client } from '@/tina/__generated__/client'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { slug: string[] } }) {
  const result = await findItem(params)
  return <div>{result.data.page.title}</div>
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
    throw new Error(`Unable to find any item`)
    // }
    // return findItem({
    //   slug: slug.slice(0, slug.length - 1),
    // })
  }
}
