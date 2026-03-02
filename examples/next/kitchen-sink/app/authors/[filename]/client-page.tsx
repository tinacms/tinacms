'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { customComponents } from '@/components/markdown-components'
import { useLayout } from '@/components/layout/layout-context'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function AuthorClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  const { theme } = useLayout()

  const titleColorClasses: Record<string, string> = {
    blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
    teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
    green: 'from-green-400 to-green-600 dark:from-green-300 dark:to-green-500',
    red: 'from-red-400 to-red-600 dark:from-red-300 dark:to-red-500',
    pink: 'from-pink-300 to-pink-500',
    purple: 'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
    orange: 'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
    yellow: 'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
  }

  if (data?.author) {
    return (
      <Section className="flex-1">
        <Container width="small" size="large">
          <div className="flex flex-col items-center text-center mb-16">
            {data.author.avatar && (
              <img
                src={data.author.avatar}
                alt={data.author.name}
                className="w-32 h-32 rounded-full mb-6 object-cover shadow-sm"
              />
            )}
            <h1 className="w-full relative mb-4 text-5xl font-extrabold tracking-normal title-font">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColorClasses[theme.color] || titleColorClasses.blue}`}>
                {data.author.name}
              </span>
            </h1>
            {data.author.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                {data.author.description}
              </p>
            )}
          </div>

          {data.author.body && (
            <div className="prose prose-lg dark:prose-dark w-full max-w-none mb-8">
              <TinaMarkdown components={customComponents} content={data.author.body} />
            </div>
          )}

          {data.author.hobbies && data.author.hobbies.length > 0 && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {data.author.hobbies.map((hobby: any, idx: number) => {
                  const hobbyText = typeof hobby === 'string' ? hobby : hobby?.name || hobby?.title || String(hobby)
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      {hobbyText}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </Container>
      </Section>
    )
  }

  return <div className="py-12 text-center text-gray-500">No data</div>
}
