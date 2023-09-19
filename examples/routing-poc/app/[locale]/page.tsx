import { client } from '@/tina/__generated__/client'

export default async function Page({ params }: { params: { locale: string } }) {
  const data = await client.queries.page({
    relativePath: `${params.locale}/_index.mdx`,
  })
  return (
    <div className="h-screen w-full bg-green-100 flex">
      <div className="h-screen w-64 bg-blue-100 flex flex-col gap-2 overflow-scroll">
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <h2>{data.data.page.title}</h2>
      </div>
      <div>Page</div>
    </div>
  )
}
