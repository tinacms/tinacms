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

export default function TagClientPage(props: TinaProps) {
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

  if (data?.tag) {
    return (
      <Section className="flex-1">
        <Container width="small" size="large">
          <h1 className="w-full relative mb-8 text-5xl font-extrabold tracking-normal text-center title-font">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColorClasses[theme.color] || titleColorClasses.blue}`}>
              {data.tag.name || data.tag.title}
            </span>
          </h1>
        </Container>
      </Section>
    )
  }

  return <div className="py-12 text-center text-gray-500">No data</div>
}
