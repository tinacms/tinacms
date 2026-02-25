import client from '@/tina/__generated__/client'
import PageClientComponent from './page/[filename]/client-page'

export default async function Page() {
  try {
    const tinaProps = await client.queries.page({ relativePath: 'home.mdx' })
    return (
      <PageClientComponent
        query={tinaProps.query}
        variables={tinaProps.variables}
        data={JSON.parse(JSON.stringify(tinaProps.data))}
      />
    )
  } catch (e) {
    return (
      <main className="py-12 px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-red-700 dark:text-red-400">Error loading home page</h1>
            <pre className="mt-4 text-sm text-red-600 dark:text-red-500 overflow-auto bg-white dark:bg-gray-800 p-4 rounded border border-red-200 dark:border-red-800">{String(e)}</pre>
          </div>
        </div>
      </main>
    )
  }
}

