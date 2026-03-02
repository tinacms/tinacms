import Link from 'next/link'
import React from 'react'
import client from '../../tina/__generated__/client'
import { format } from 'date-fns'
import Layout from '@/components/layout/layout'

export default async function BlogsPage() {
  const connection = await client.queries.blogConnection()
  const blogs = connection.data.blogConnection.edges ?? []

  return (
    <Layout>
      <section className="flex-1 relative transition duration-150 ease-out body-font overflow-hidden text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-24">
        <h1 className="text-4xl font-extrabold tracking-tight mb-12 text-center title-font">Blog</h1>
        <div className="grid gap-8 md:grid-cols-2">
          {blogs.map((edge: any) => {
            const blog = edge.node
            const href = `/blog/${blog._sys.filename}`
            let formattedDate = ''
            if (blog.pubDate) {
              try {
                formattedDate = format(new Date(blog.pubDate), 'MMM dd, yyyy')
              } catch (e) {}
            }

            return (
              <Link
                key={blog._sys.filename}
                href={href}
                className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {blog.heroImage && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={blog.heroImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {blog.title}
                  </h2>
                  {blog.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 flex-1">
                      {blog.description}
                    </p>
                  )}
                  <div className="flex items-center mt-4 gap-2">
                    {blog.author?.avatar && (
                      <img
                        src={blog.author.avatar}
                        alt={blog.author?.name || ''}
                        className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    {blog.author?.name && (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {blog.author.name}
                      </span>
                    )}
                    {blog.author?.name && formattedDate && (
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                    )}
                    {formattedDate && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formattedDate}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      </section>
    </Layout>
  )
}
