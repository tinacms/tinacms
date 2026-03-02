import client from '@/tina/__generated__/client'
import Layout from '@/components/layout/layout'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'

export const revalidate = 300

const EXAMPLE_QUERY = `query PostsQuery {
  postConnection {
    edges {
      node {
        id
        title
        date
        excerpt
        author {
          ... on Author {
            name
          }
        }
      }
    }
  }
}`

export default async function GraphQLDemoPage() {
  let posts: any[] = []
  let error: string | null = null

  try {
    const result = await client.queries.postConnection()
    posts = result.data?.postConnection?.edges?.map((e: any) => e?.node).filter(Boolean) ?? []
  } catch (e) {
    error = String(e)
  }

  return (
    <Layout>
      {/* Hero */}
      <Section color="primary">
        <Container size="large" className="py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            TinaCMS GraphQL API
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Every collection you define in TinaCMS is automatically exposed as a
            fully typed GraphQL API. Query your content from anywhere — your
            frontend, CI pipelines, or external tools.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="/api/gql"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2.5 rounded-full shadow hover:shadow-md transition"
            >
              View raw endpoint ↗
            </a>
            <a
              href="/admin/index.html"
              target="_blank"
              className="inline-flex items-center gap-2 border border-white/60 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition"
            >
              Open CMS admin ↗
            </a>
          </div>
        </Container>
      </Section>

      {/* Query section */}
      <Section color="tint">
        <Container size="large" className="py-12">
          <h2 className="text-2xl font-bold mb-2">Example Query</h2>
          <p className="text-base opacity-75 mb-6">
            The query below is what the{' '}
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              postConnection
            </code>{' '}
            resolver returns. Every collection gets a{' '}
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              Connection
            </code>{' '}
            type with cursor-based pagination built in.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-gray-900 text-green-300 text-sm leading-relaxed p-6 shadow-lg">
            {EXAMPLE_QUERY}
          </pre>
        </Container>
      </Section>

      {/* Live results */}
      <Section color="default">
        <Container size="large" className="py-12">
          <h2 className="text-2xl font-bold mb-2">Live Results</h2>
          <p className="text-base opacity-75 mb-6">
            Fetched at request time using the generated typed client —{' '}
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              client.queries.postConnection()
            </code>
            .
          </p>

          {error ? (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <p className="opacity-60 italic">No posts found.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3 font-medium">{post.title}</td>
                      <td className="px-4 py-3 opacity-70">{post.author?.name ?? '—'}</td>
                      <td className="px-4 py-3 opacity-70">
                        {post.date ? new Date(post.date).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </Section>

      {/* Generated client callout */}
      <Section color="tint">
        <Container size="large" className="py-12">
          <h2 className="text-2xl font-bold mb-4">Generated Typed Client</h2>
          <p className="text-base opacity-75 mb-6">
            TinaCMS generates a fully typed client from your schema. Every query
            is statically typed — no hand-written GraphQL needed.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-gray-900 text-blue-200 text-sm leading-relaxed p-6 shadow-lg">{`import client from '@/tina/__generated__/client'

// Fully typed — your IDE knows the shape of every field
const result = await client.queries.postConnection()
const posts = result.data.postConnection.edges.map(e => e.node)
`}</pre>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://tina.io/docs/data-fetching/overview"
              target="_blank"
              className="text-sm font-semibold text-orange-500 hover:underline"
            >
              Data fetching docs →
            </a>
            <a
              href="https://tina.io/docs/graphql/overview"
              target="_blank"
              className="text-sm font-semibold text-orange-500 hover:underline"
            >
              GraphQL API reference →
            </a>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}
