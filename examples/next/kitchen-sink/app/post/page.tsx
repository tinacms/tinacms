import Link from 'next/link'
import React from 'react'
import client from '../../tina/__generated__/client'

export default async function PostPage() {
  const connection = await client.queries.postConnection()
  const posts = connection.data.postConnection.edges

  return (
    <main className="py-12 px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-12 text-gray-900 dark:text-gray-50">Posts</h1>
        <div className="space-y-6">
          {posts.map((edge: any) => {
            const post = edge.node
            const breadcrumbs = post._sys?.breadcrumbs || []
            const href = `/post/${breadcrumbs.join('/')}`
            const title = post.title || post._sys.filename
            
            return (
              <div key={post._sys.filename} className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-r">
                <Link 
                  href={href}
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {title}
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  {breadcrumbs.join(' / ')}
                </p>
                {post.categories && post.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.categories.map((category: string) => (
                      <span key={category} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
