'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { format } from 'date-fns'
import { customComponents } from '@/components/markdown-components'
import { useTheme } from '@/components/layout'

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
  const theme = useTheme()

  if (data?.post) {
    const authorImage = data.post.author?.image || data.post.author?.avatar
    const authorName = typeof data.post.author === 'string' ? data.post.author : data.post.author?.name || 'Unknown'

    const titleColorClasses: Record<string, string> = {
      blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
      teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
      green: 'from-green-400 to-green-600 dark:from-green-300 dark:to-green-500',
      red: 'from-red-400 to-red-600 dark:from-red-300 dark:to-red-500',
      pink: 'from-pink-300 to-pink-500 dark:from-pink-300 dark:to-pink-500',
      purple: 'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
      orange: 'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
      yellow: 'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
    }
    
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
        <article className="max-w-4xl mx-auto">
          <header className="mb-12 pb-8 text-center">
            <h1 className="w-full relative mb-8 text-6xl font-extrabold tracking-normal title-font">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColorClasses[theme.color] || titleColorClasses.blue}`}>
                {data.post.title}
              </span>
            </h1>
            {data.post.author && (
              <div className="flex items-center justify-center gap-4 mb-8 group">
                {authorImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={authorImage}
                      alt={authorName}
                      className="h-14 w-14 object-cover rounded-full shadow-sm"
                    />
                  </div>
                )}
                <p className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white">
                  {authorName}
                </p>
                {formattedDate && (
                  <>
                    <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">—</span>
                    <p className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150">
                      {formattedDate}
                    </p>
                  </>
                )}
              </div>
            )}
            {data.post.categories && data.post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {data.post.categories.map((category: any) => {
                  const categoryText = typeof category === 'string' ? category : category?.title || category?.name || 'Unknown'
                  return (
                    <span key={categoryText} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
                      {categoryText}
                    </span>
                  )
                })}
              </div>
            )}
          </header>
          
          {data.post.heroImg && (
            <div className="px-4 w-full mb-12">
              <div className="relative max-w-4xl lg:max-w-5xl mx-auto">
                <img
                  src={data.post.heroImg}
                  className="absolute block rounded-lg w-full h-auto blur-2xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light"
                  aria-hidden="true"
                  alt=""
                />
                <img
                  src={data.post.heroImg}
                  alt={data.post.title}
                  className="relative z-10 mb-14 block rounded-lg w-full h-auto opacity-100"
                />
              </div>
            </div>
          )}
          
          <div className="prose prose-lg dark:prose-dark w-full max-w-none">
            <TinaMarkdown components={customComponents} content={data.post.body} />
          </div>
        </article>
      </main>
    )
  }

  return <div className="py-12 px-6 text-center text-gray-600 dark:text-gray-400">No post found</div>
}
