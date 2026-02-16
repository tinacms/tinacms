'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { format } from 'date-fns'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function BlogPostClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  if (data?.post) {
    const authorImage = data.post.author?.image || data.post.author?.avatar
    const authorName = typeof data.post.author === 'string' ? data.post.author : data.post.author?.name || 'Unknown'
    
    let formattedDate = ''
    if (data.post.date) {
      try {
        const date = new Date(data.post.date)
        if (!isNaN(date.getTime())) {
          formattedDate = format(date, 'MMM dd, yyyy')
        }
      } catch (e) {
        // Invalid date format, skip
      }
    }
    
    return (
      <main className="py-12 px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
        <article className="max-w-3xl mx-auto">
          <header className="mb-8 pb-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-50 mb-8">
              {data.post.title}
            </h1>
            {data.post.author && (
              <div className="flex items-center justify-center gap-4 mb-6">
                {authorImage && (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="h-14 w-14 object-cover rounded-full shadow-sm"
                  />
                )}
                <p className="text-base font-medium text-gray-600 dark:text-gray-300">
                  {authorName}
                </p>
                {formattedDate && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      {formattedDate}
                    </p>
                  </>
                )}
              </div>
            )}
            {data.post.categories && data.post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {data.post.categories.map((category: any) => {
                  const categoryText = typeof category === 'string' ? category : category?.title || category?.name || 'Unknown';
                  return (
                    <span key={categoryText} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
                      {categoryText}
                    </span>
                  );
                })}
              </div>
            )}
          </header>
          <div className="prose prose-lg dark:prose-dark max-w-none">
            <TinaMarkdown content={data.post.body} />
          </div>
        </article>
      </main>
    )
  }

  return <div className="py-12 px-6 text-center text-gray-600 dark:text-gray-400">No post found</div>
}
