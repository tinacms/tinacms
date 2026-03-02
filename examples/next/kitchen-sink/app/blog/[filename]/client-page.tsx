'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { format } from 'date-fns'
import { customComponents } from '@/components/markdown-components'
import { useLayout } from '@/components/layout/layout-context'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function BlogClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  const { theme } = useLayout()

  if (data?.blog) {
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
    if (data.blog.pubDate) {
      try {
        const date = new Date(data.blog.pubDate)
        if (!isNaN(date.getTime())) {
          formattedDate = format(date, 'MMM dd, yyyy')
        }
      } catch (e) {
        // Invalid date format, skip
      }
    }

    let formattedUpdatedDate = ''
    if (data.blog.updatedDate) {
      try {
        const date = new Date(data.blog.updatedDate)
        if (!isNaN(date.getTime())) {
          formattedUpdatedDate = format(date, 'MMM dd, yyyy')
        }
      } catch (e) {}
    }

    return (
      <Section className="flex-1">
        <Container width="small" size="large">
          <h1 className="w-full relative mb-8 text-6xl font-extrabold tracking-normal text-center title-font">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColorClasses[theme.color] || titleColorClasses.blue}`}>
              {data.blog.title}
            </span>
          </h1>

          {data.blog.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-center">
              {data.blog.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mb-16">
            {data.blog.author?.avatar && (
              <img
                src={data.blog.author.avatar}
                alt={data.blog.author?.name || ''}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0 shadow-sm"
              />
            )}
            <div className="flex flex-col items-start">
              {data.blog.author?.name && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {data.blog.author.name}
                </span>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                {formattedDate && <span>Published {formattedDate}</span>}
                {formattedUpdatedDate && formattedUpdatedDate !== formattedDate && (
                  <>
                    <span className="text-gray-200 dark:text-gray-700">·</span>
                    <span>Updated {formattedUpdatedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>

        {data.blog.heroImage && (
          <div className="px-4 w-full">
            <div className="relative max-w-4xl lg:max-w-5xl mx-auto">
              <img
                src={data.blog.heroImage}
                className="absolute block rounded-lg w-full h-auto blur-2xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light"
                aria-hidden="true"
                alt=""
              />
              <img
                src={data.blog.heroImage}
                alt={data.blog.title}
                className="relative z-10 mb-14 block rounded-lg w-full h-auto opacity-100"
              />
            </div>
          </div>
        )}

        <Container className="flex-1 pt-4" width="small" size="large">
          <div className="prose dark:prose-dark w-full max-w-none">
            <TinaMarkdown components={customComponents} content={data.blog._body} />
          </div>
        </Container>
      </Section>
    )
  }

  return <div className="py-12 px-6 text-center text-gray-600 dark:text-gray-400">No blog post found</div>
}
