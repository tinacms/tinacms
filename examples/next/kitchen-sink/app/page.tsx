import client from '@/tina/__generated__/client'
import PageClientComponent from './page/[filename]/client-page'

export default async function Page() {
  try {
    const tinaProps = await client.queries.page({ relativePath: 'home.md' })
    return (
      <PageClientComponent
        query={tinaProps.query}
        variables={tinaProps.variables}
        data={JSON.parse(JSON.stringify(tinaProps.data))}
      />
    )
  } catch (e) {
    return (
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-red-700">Error loading home page</h1>
            <pre className="mt-4 text-sm text-red-600">{String(e)}</pre>
          </div>
        </div>
      </main>
    )
  }
}
