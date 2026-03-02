'use client'

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { useLayout } from '@/components/layout/layout-context'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { customComponents } from '@/components/markdown-components'

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

interface PostClientPageProps {
  data: any
  variables: any
  query: string
}

export default function PostClientPage(props: PostClientPageProps) {
  const { theme } = useLayout()
  const { data } = useTina({ ...props })
  const post = data.post

  if (!post) {
    return (
      <div className="py-12 px-6 text-center text-gray-600 dark:text-gray-400">
        No post found
      </div>
    )
  }

  const date = new Date(post.date)
  let formattedDate = ''
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy')
  }

  const titleColour = titleColorClasses[theme.color] || titleColorClasses.blue

  // Derive author page URL from the author reference
  const authorFilename = post.author?._sys?.filename

  return (
    <Section className="flex-1">
      <Container width="small" className="flex-1 pb-2" size="large">
        <h2 className="w-full relative mb-8 text-6xl font-extrabold tracking-normal text-center title-font">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColour}`}>
            {post.title}
          </span>
        </h2>
        <div className="flex items-center justify-center mb-16">
          {post.author && (
            <>
              {post.author.avatar && (
                <div className="flex-shrink-0 mr-4">
                  <img
                    className="h-14 w-14 object-cover rounded-full shadow-sm"
                    src={post.author.avatar}
                    alt={post.author.name || ''}
                  />
                </div>
              )}
              {authorFilename ? (
                <Link
                  href={`/authors/${authorFilename}`}
                  className="text-base font-medium text-gray-600 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 transition-colors underline-offset-2 hover:underline"
                >
                  {post.author.name}
                </Link>
              ) : (
                <p className="text-base font-medium text-gray-600 dark:text-gray-200">
                  {post.author.name}
                </p>
              )}
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p className="text-base text-gray-400 dark:text-gray-300">
            {formattedDate}
          </p>
        </div>
      </Container>
      {post.heroImg && (
        <div className="px-4 w-full">
          <div className="relative max-w-4xl lg:max-w-5xl mx-auto">
            <img
              src={post.heroImg}
              className="absolute block rounded-lg w-full h-auto blur-2xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light"
              aria-hidden="true"
              alt=""
            />
            <img
              src={post.heroImg}
              alt={post.title}
              className="relative z-10 mb-14 block rounded-lg w-full h-auto opacity-100"
            />
          </div>
        </div>
      )}
      <Container className="flex-1 pt-4" width="small" size="large">
        <div className="prose dark:prose-dark w-full max-w-none">
          <TinaMarkdown components={customComponents} content={post._body} />
        </div>
      </Container>
    </Section>
  )
}
