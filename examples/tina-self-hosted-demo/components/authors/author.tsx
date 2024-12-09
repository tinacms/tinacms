import React from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { useTheme } from '../layout'
import { Container } from '../util/container'
import { Section } from '../util/section'

export const Author = ({
  data,
  listMode,
}: {
  data: any
  listMode?: boolean
}) => {
  const theme = useTheme()
  const titleColorClasses = {
    blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
    teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
    pink: 'from-pink-300 to-pink-500',
    purple:
      'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
    orange:
      'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
    yellow:
      'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
  }
  return (
    <div className="flex flex-col items-center">
      <Section className="flex-1 p-4">
        <div className="flex flex-col items-center">
          <img
            data-tinafield="avatar"
            className="h-20 w-20 object-cover rounded-full shadow-sm"
            src={data?.avatar}
            alt={data?.name}
          />
          {listMode && (
            <a
              href={`/authors/${data?._sys?.filename}`}
              className="text-lg font-semibold title-font mt-4"
            >
              {data?.name}
            </a>
          )}
          {!listMode && (
            <h1
              data-tinafield="name"
              className={`text-2xl font-semibold title-font mt-4 ${
                titleColorClasses[theme.color]
              }`}
            >
              {data?.name}
            </h1>
          )}
        </div>
        {!listMode && (
          <div className="p-4">
            <h2 className="text-2xl font-semibold title-font">Posts</h2>
            {data?.post?.edges?.map((post) => {
              return (
                <div key={post.node.id} className="flex flex-col items-left">
                  <Container
                    className={`prose ${
                      data.color === 'primary'
                        ? `prose-primary`
                        : `dark:prose-dark`
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold title-font ${
                        titleColorClasses[theme.color]
                      }`}
                    >
                      {post.node.title}
                    </h3>
                    <TinaMarkdown content={post.node.excerpt} />
                  </Container>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
