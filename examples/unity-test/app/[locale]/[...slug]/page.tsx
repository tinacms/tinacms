import { client } from '@/tina/__generated__/client'

export default async function Page({
  params,
}: {
  params: { locale: string; slug: string[] }
}) {
  let data
  try {
    data = await client.queries.page({
      relativePath: `${[params.locale, ...params.slug].join('/')}.mdx`,
    })
  } catch (e) {
    // Fall back to the _index.mdx file, if it exists
    data = await client.queries.page({
      relativePath: `${[params.locale, ...params.slug, '_index'].join(
        '/'
      )}.mdx`,
    })
    console.log('gotit', data)
  }
  return (
    <div className="h-screen w-full bg-green-100 flex">
      <div className="w-48">
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <h2>{data.data.page.title}</h2>
      </div>
    </div>
  )
}
