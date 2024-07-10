/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import { Container } from '../util/container'
import { Section } from '../util/section'
import { useTheme } from '../layout'
import format from 'date-fns/format'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Prism } from 'tinacms/dist/rich-text/prism'
import type { TinaMarkdownContent, Components } from 'tinacms/dist/rich-text'
import { PostType } from '../../pages/posts/[filename]'
import { tinaField } from 'tinacms/dist/react'

interface BlockQuoteProps {
  children: TinaMarkdownContent
  authorName: string
}

interface DateTimeProps {
  format?: string
}

interface NewsletterSignupProps {
  placeholder: string
  buttonText: string
  children: TinaMarkdownContent
  disclaimer?: TinaMarkdownContent
}

interface DropBoxProps {
  title: string
  body: TinaMarkdownContent
}

// Define the Components type
type Components = {
  BlockQuote: React.FC<BlockQuoteProps>
  DateTime: React.FC<DateTimeProps>
  NewsletterSignup: React.FC<NewsletterSignupProps>
  DropBox: React.FC<DropBoxProps>
  code_block: React.FC<any> //TODO: Check if we still need this component
}

// Implement the components
const components: Components = {
  //TODO: Check if we still need this component
  code_block: (props) => <Prism {...props} />,

  BlockQuote: ({ children, authorName }: BlockQuoteProps) => (
    <div>
      <blockquote>
        <TinaMarkdown content={children} />
        {authorName}
      </blockquote>
    </div>
  ),

  DateTime: ({ format }: DateTimeProps) => {
    const dt = React.useMemo(() => new Date(), [])
    const formatDate = () => {
      switch (format) {
        case 'iso':
          return dt.toISOString()
        case 'utc':
          return dt.toUTCString()
        case 'local':
        default:
          return dt.toLocaleDateString()
      }
    }
    return <span>{formatDate()}</span>
  },

  NewsletterSignup: ({
    placeholder,
    buttonText,
    children,
    disclaimer,
  }: NewsletterSignupProps) => (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="">
          <TinaMarkdown content={children} />
        </div>
        <div className="mt-8">
          <form className="sm:flex">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email-address"
              type="email"
              autoComplete="email"
              required
              className="w-full px-5 py-3 border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs rounded-md"
              placeholder={placeholder}
            />
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {buttonText}
              </button>
            </div>
          </form>
          <div className="mt-3 text-sm text-gray-500">
            {disclaimer && <TinaMarkdown content={disclaimer} />}
          </div>
        </div>
      </div>
    </div>
  ),

  DropBox: ({ title, body }: DropBoxProps) => (
    <>
      <h2>{title}</h2>
      <TinaMarkdown content={body} />
    </>
  ),
}

export const Post = (props: PostType) => {
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

  const date = new Date(props.date)
  let formattedDate = ''
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy')
  }

  return (
    <Section className="flex-1">
      <Container width="small" className={`flex-1 pb-2`} size="large">
        <h2
          data-tina-field={tinaField(props, 'title')}
          className={`w-full relative	mb-8 text-6xl font-extrabold tracking-normal text-center title-font`}
        >
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${
              titleColorClasses[theme.color]
            }`}
          >
            {props.title}
          </span>
        </h2>
        <div
          data-tina-field={tinaField(props, 'author')}
          className="flex items-center justify-center mb-16"
        >
          {props.author && (
            <>
              <div className="flex-shrink-0 mr-4">
                <img
                  data-tina-field={tinaField(props.author, 'avatar')}
                  className="h-14 w-14 object-cover rounded-full shadow-sm"
                  src={props.author.avatar}
                  alt={props.author.name}
                />
              </div>
              <p
                data-tina-field={tinaField(props.author, 'name')}
                className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white"
              >
                {props.author.name}
              </p>
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p
            data-tina-field={tinaField(props, 'date')}
            className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150"
          >
            {formattedDate}
          </p>
        </div>
      </Container>
      {props.heroImg && (
        <div className="px-4 w-full">
          <div
            data-tina-field={tinaField(props, 'heroImg')}
            className="relative max-w-4xl lg:max-w-5xl mx-auto"
          >
            <img
              src={props.heroImg}
              className="absolute block rounded-lg w-full h-auto blur-2xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light"
              aria-hidden="true"
            />
            <img
              src={props.heroImg}
              alt={props.title}
              className="relative z-10 mb-14 block rounded-lg w-full h-auto opacity-100"
            />
          </div>
        </div>
      )}
      <Container className={`flex-1 pt-4`} width="small" size="large">
        <div
          data-tina-field={tinaField(props, '_body')}
          className="prose dark:prose-dark w-full max-w-none"
        >
          <TinaMarkdown components={components} content={props._body} />
        </div>
      </Container>
    </Section>
  )
}
