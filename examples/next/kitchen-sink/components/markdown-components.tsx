'use client'
import React from 'react'
import { TinaMarkdown, type Components, type TinaMarkdownContent } from 'tinacms/dist/rich-text'
import { Prism } from 'tinacms/dist/rich-text/prism'

export const customComponents: Components<{
  BlockQuote: {
    children: TinaMarkdownContent
    authorName?: string
  }
  DateTime: {
    format?: string
  }
  NewsletterSignup: {
    placeholder?: string
    buttonText?: string
    children: TinaMarkdownContent
    disclaimer?: TinaMarkdownContent
  }
}> = {
  code_block: (props) => <Prism {...props} />,
  
  BlockQuote: (props: {
    children: TinaMarkdownContent
    authorName?: string
  }) => {
    return (
      <div>
        <blockquote>
          <TinaMarkdown content={props.children} />
          {props.authorName && <p>— {props.authorName}</p>}
        </blockquote>
      </div>
    )
  },
  
  DateTime: (props) => {
    const dt = React.useMemo(() => {
      return new Date()
    }, [])

    switch (props.format) {
      case 'iso':
        return <span>{dt.toISOString()}</span>
      case 'utc':
        return <span>{dt.toUTCString()}</span>
      case 'local':
        return <span>{dt.toLocaleDateString()}</span>
      default:
        return <span>{dt.toLocaleDateString()}</span>
    }
  },
  
  NewsletterSignup: (props) => {
    const [email, setEmail] = React.useState('')

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Newsletter signup:', email)
      setEmail('')
    }

    return (
      <div className="bg-white dark:bg-gray-850">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {props.children && <TinaMarkdown content={props.children} />}
          </div>
          <div className="mt-8">
            <form className="sm:flex" onSubmit={handleSubmit}>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder={props.placeholder || 'Enter your email'}
              />
              <div className="mt-3 rounded shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3 px-5 border border-transparent text-base font-medium rounded text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-900"
                >
                  {props.buttonText || 'Subscribe'}
                </button>
              </div>
            </form>
            {props.disclaimer && (
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                <TinaMarkdown content={props.disclaimer} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },

  img: (props) => (
    <img 
      src={props.url} 
      alt={props.alt} 
      className="w-full h-auto rounded-lg shadow-md my-8 block"
    />
  ),

  // Standard markdown elements
  p: (props) => (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
      {props.children}
    </p>
  ),

  h1: (props) => (
    <h1 className="text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-50">
      {props.children}
    </h1>
  ),

  h2: (props) => (
    <h2 className="text-3xl font-bold mb-4 mt-8 text-gray-900 dark:text-gray-50">
      {props.children}
    </h2>
  ),

  h3: (props) => (
    <h3 className="text-2xl font-bold mb-3 mt-6 text-gray-800 dark:text-gray-100">
      {props.children}
    </h3>
  ),

  ul: (props) => (
    <ul className="list-disc mb-4 ml-4 pl-4 space-y-2 text-gray-700 dark:text-gray-300">
      {props.children}
    </ul>
  ),

  ol: (props) => (
    <ol className="list-decimal mb-4 ml-4 pl-4 space-y-2 text-gray-700 dark:text-gray-300">
      {props.children}
    </ol>
  ),

  li: (props) => (
    <li className="text-gray-700 dark:text-gray-300">
      {props.children}
    </li>
  ),

  blockquote: (props) => (
    <blockquote className="border-l-4 border-teal-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
      {props.children}
    </blockquote>
  ),

  hr: () => (
    <hr className="my-8 border-t border-gray-300 dark:border-gray-700" />
  ),

  a: (props) => (
    <a 
      href={props.url}
      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline"
    >
      {props.children}
    </a>
  ),
}
