import { client } from '@/tina/__generated__/client'

export default async function Page({
  params,
  children,
}: {
  params: { locale: string; version: string; slug: string[] }
  children: React.ReactNode
}) {
  const data = await findDeepestToc({
    locale: params.locale,
    version: params.version,
    slug: params.slug,
  })
  return (
    <div className="h-screen w-full bg-green-100 flex">
      <div className="h-screen w-64 bg-blue-100 flex flex-col gap-2 overflow-scroll">
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <h2>{data.data.manual.title}</h2>
      </div>
      {children}
    </div>
  )
}

const findDeepestToc = async ({
  locale,
  version,
  slug,
}: {
  locale: string
  version: string
  slug: string[]
}): Promise<ReturnType<(typeof client)['queries']['manual']>> => {
  try {
    const path = `${[locale, version, ...slug].join('/')}/_index.mdx`
    const result = await client.queries.manual({
      relativePath: path,
    })
    return result
  } catch (e) {
    if (slug.length === 0) {
      throw new Error(`Unable to find any ToC`)
    }
    return findDeepestToc({
      locale,
      version,
      slug: slug.slice(0, slug.length - 1),
    })
  }
}
