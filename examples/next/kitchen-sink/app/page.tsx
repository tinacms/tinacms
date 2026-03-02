import client from '@/tina/__generated__/client'
import Layout from '@/components/layout/layout'
import ClientPage from './[...urlSegments]/client-page'

export const revalidate = 300

export default async function Home() {
  try {
    const data = await client.queries.page({ relativePath: 'home.mdx' })
    return (
      <Layout rawPageData={data}>
        <ClientPage {...data} />
      </Layout>
    )
  } catch (e) {
    return (
      <Layout>
        <main className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-red-700 dark:text-red-400">Error loading home page</h1>
            <pre className="mt-4 text-sm text-red-600 dark:text-red-500 overflow-auto bg-white dark:bg-gray-800 p-4 rounded border border-red-200 dark:border-red-800">{String(e)}</pre>
          </div>
        </main>
      </Layout>
    )
  }
}

