import client from '@/tina/__generated__/client'

export default async function SidebarLayout({ params, children }) {
  const { data } = await client.queries.sidebar({
    relativePath: `manual/${params.version}/${params.locale}.json`,
  })
  console.log(params)

  return (
    <>
      <div className="h-screen w-96 bg-blue-100">Type TOC</div>
      {children}
    </>
  )
}
