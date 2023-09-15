import client from '@/tina/__generated__/client'

export default async function Page({ params }) {
  const node = await client.queries.page({
    relativePath: `manual/${params.version}/${params.locale}/${params.slugs}.mdx`,
  })

  return (
    <div className="w-full h-full bg-yellow-100 overflow-scroll">
      <div className="h-12 bg-orange-100 w-full"></div>
      <pre className="w-24">{JSON.stringify(node, null, 2)}</pre>
    </div>
  )
}
