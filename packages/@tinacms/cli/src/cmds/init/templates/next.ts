export type NextTemplateTypes =
  | 'vercel-kv-credentials-provider-register-api-handler'
  | 'vercel-kv-credentials-provider-signin'
  | 'vercel-kv-credentials-provider-register'
  | 'vercel-kv-credentials-provider-tailwindcss'
  | 'next-auth-api-handler'
  | 'demo-post-page'

export const templates: {
  [key in NextTemplateTypes]: (opts?: {
    nextAuthCredentialsProviderName?: string
    usingSrc?: boolean
    dataLayer?: boolean
  }) => string
} = {
  ['demo-post-page']: ({
    usingSrc,
    dataLayer,
  }: {
    usingSrc: boolean
    dataLayer: boolean
  }) => {
    return `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
// This is a demo file once you have tina setup feel free to delete this file

import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '${usingSrc ? '../' : ''}../../../tina/__generated__/${
      dataLayer ? 'databaseClient' : 'client'
    }'

const BlogPage = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <>
      <Head>
        {/* Tailwind CDN */}
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css'
          integrity='sha512-y6ZMKFUQrn+UUEVoqYe8ApScqbjuhjqzTuwUMEGMDuhS2niI8KA3vhH2LenreqJXQS+iIXVTRL2iaNfJbDNA1Q=='
          crossOrigin='anonymous'
          referrerPolicy='no-referrer'
        />
      </Head>
      <div>
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <h1 className='text-3xl m-8 text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
            {data.post.title}
          </h1>
          <ContentSection content={data.post.body}></ContentSection>
        </div>
        <div className='bg-green-100 text-center'>
          Lost and looking for a place to start?
          <a
            href='https://tina.io/guides/tina-cloud/getting-started/overview/'
            className='text-blue-500 underline'
          >
            {' '}
            Check out this guide
          </a>{' '}
          to see how add TinaCMS to an existing Next.js site.
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  let data = {}
  let query = {}
  let variables = { relativePath: \`\${params.filename}.md\` }
  try {
    const res = await client.queries.post(variables)
    query = res.query
    data = res.data
    variables = res.variables
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      variables: variables,
      data: data,
      query: query,
      //myOtherProp: 'some-other-data',
    },
  }
}

export const getStaticPaths = async () => {
  const postsListData = await client.queries.postConnection()

  return {
    paths: postsListData.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: false,
  }
}

export default BlogPage

const PageSection = (props) => {
  return (
    <>
      <h2>{props.heading}</h2>
      <p>{props.content}</p>
    </>
  )
}

const components = {
  PageSection: PageSection,
}

const ContentSection = ({ content }) => {
  return (
    <div className='relative py-16 bg-white overflow-hidden text-black'>
      <div className='hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full'>
        <div
          className='relative h-full text-lg max-w-prose mx-auto'
          aria-hidden='true'
        >
          <svg
            className='absolute top-12 left-full transform translate-x-32'
            width={404}
            height={384}
            fill='none'
            viewBox='0 0 404 384'
          >
            <defs>
              <pattern
                id='74b3fd99-0a6f-4271-bef2-e80eeafdf357'
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className='text-gray-200'
                  fill='currentColor'
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill='url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)'
            />
          </svg>
          <svg
            className='absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32'
            width={404}
            height={384}
            fill='none'
            viewBox='0 0 404 384'
          >
            <defs>
              <pattern
                id='f210dbf6-a58d-4871-961e-36d5016a0f49'
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className='text-gray-200'
                  fill='currentColor'
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill='url(#f210dbf6-a58d-4871-961e-36d5016a0f49)'
            />
          </svg>
          <svg
            className='absolute bottom-12 left-full transform translate-x-32'
            width={404}
            height={384}
            fill='none'
            viewBox='0 0 404 384'
          >
            <defs>
              <pattern
                id='d3eb07ae-5182-43e6-857d-35c643af9034'
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className='text-gray-200'
                  fill='currentColor'
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill='url(#d3eb07ae-5182-43e6-857d-35c643af9034)'
            />
          </svg>
        </div>
      </div>
      <div className='relative px-4 sm:px-6 lg:px-8'>
        <div className='text-lg max-w-prose mx-auto'>
          <TinaMarkdown components={components} content={content} />
        </div>
      </div>
    </div>
  )
}
`
  },
  ['vercel-kv-credentials-provider-register-api-handler']:
    () => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
import { userStore } from '../../../tina/auth'

export default async function handler(req, res) {
  const { username, password } = req.body
  if (req.method === 'POST') {
    if (!username || !password) {
      res.status(400).json({ message: 'Missing username or password' })
    } else {
      try {
        const success = await userStore.addUser(username, password)
        if (success) {
          res.status(200).json({ message: 'User added' })
        } else {
          res.status(400).json({ message: 'User already exists' })
        }
      } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  } else {
    res.status(400).json({ message: 'Invalid request' })
  }
}`,
  ['next-auth-api-handler']:
    () => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import NextAuth from 'next-auth'
import { authOptions } from '../../../tina/auth'

export default NextAuth(authOptions)
`,
  ['vercel-kv-credentials-provider-register']: ({
    nextAuthCredentialsProviderName,
  }: {
    nextAuthCredentialsProviderName: string
  }) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'

import styles from './tw.module.css'

export default function Register({ userSetupRequired }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [status, setStatus] = useState('initial')

  useEffect(() => {
    if (!userSetupRequired) {
      setStatus('error')
      setMessage('User setup already completed')
    }
  }, [userSetupRequired])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (password !== confirmPassword) {
      setMessage('Password mismatch')
      setStatus('error')
      return
    }
    setMessage('Creating user...')
    setStatus('loading')
    const res = await fetch('/api/credentials/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      setStatus('success')
      setMessage('User created')
      await signIn('${nextAuthCredentialsProviderName}', { callbackUrl: '/admin/index.html' })
    } else {
      const { message } = await res.json()
      setMessage(message)
      setStatus('error')
    }
  }

  if (message && status !== 'initial' && status !== 'error') {
    return (
      <div
        className={\`\${styles.grid} \${styles['h-screen']} \${styles['w-screen']} \${styles['place-items-center']}  \${styles['px-4']}\${styles['text-sm']}\${styles['font-medium']} \`}
      >
        {message}
      </div>
    )
  }

  const disabled =
    !username || !password || !confirmPassword || !userSetupRequired

  return (
    <div
      className={\`\${styles.grid} \${styles['h-screen']} \${styles['w-screen']} \${styles['place-items-center']} \${styles['px-4']} \${styles['text-sm']} \${styles['font-medium']}\`}
    >
      <div
        className={\`\${styles['w-full']} \${styles['max-w-sm']} \${styles['rounded-lg']} \${styles['shadow']}\`}
      >
        <div
          className={\`\${styles.flex} \${styles['flex-col']}  \${styles['items-center']} \${styles['justify-center']} \${styles['gap-4']}\`}
        >
          <img src='../tina.svg' alt='TinaCMS Logo' height={100} width={72} />
          {message && (
            <div
              className={\`\${styles['bg-red-500']} \${styles['text-white']} \${styles['rounded-md']} \${styles['p-3']}\`}
            >
              Error: {message}
            </div>
          )}
        </div>
        <div className={\`\${styles['p-6']}\`}>
          <div className='grid gap-y-3'>
            <input
              className={\`\${styles['focus:border-purple-400']} \${styles['rounded-md']} \${styles['border']} \${styles['py-3']} \${styles['px-4']} \${styles['outline-none']} \${styles['transition']}}\`}
              placeholder='Enter username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className={\`\${styles['focus:border-purple-400']} \${styles['rounded-md']} \${styles['border']} \${styles['py-3']} \${styles['px-4']} \${styles['outline-none']} \${styles['transition']}}\`}
              placeholder='Enter password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              placeholder='Confirm password'
              className={\`\${styles['focus:border-purple-400']} \${styles['rounded-md']} \${styles['border']} \${styles['py-3']} \${styles['px-4']} \${styles['outline-none']} \${styles['transition']}}\`}
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              className={\`\${styles['flex']} \${styles['items-center']} \${
    styles['justify-center']
  } \${styles['gap-x-2']} \${styles['rounded-md']} \${
    styles['border']
  } \${styles['border-gray-300']} \${styles['bg-white']} \${
    styles['py-3']
  } \${styles['px-4']} \${styles['text-gray-700']} \${
    styles['transition']
  } \${styles['hover:text-purple-400']} \${
    disabled ? 
    \`\${styles['opacity-50']} \${styles['cursor-not-allowed']}\` : 
    \`\${styles['hover:border-purple-400']}\`
  }}\`}
              disabled={disabled}
              onClick={handleSubmit}
            >
              Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { userStore } = await import('../../tina/auth')
  return {
    props: {
      userSetupRequired: !(await userStore.isInitialized())
    },
  }
}
`,
  ['vercel-kv-credentials-provider-signin']:
    () => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// @ts-nocheck
import { getCsrfToken } from 'next-auth/react'

import styles from './tw.module.css'

export default function SignIn({ csrfToken, error, userSetupRequired }) {
  if (userSetupRequired) {
    return (
      <div
        className={\`\${styles.grid} \${styles['h-screen']} \${styles['w-screen']} \${styles['place-items-center']} \${styles['px-4']} \${styles['text-sm']} \${styles['font-medium']}\`}
      >
        <div
          className={\`\${styles['w-full']} \${styles['max-w-sm']} \${styles['rounded-lg']} \${styles['bg-gray-200']} \${styles['shadow']} \${styles['p-10']}\`}
        >
          <img src='../tina.svg' alt='TinaCMS Logo' height={100} width={72} />
          <div className={styles['text-gray-600']}>
            User setup required. Click{' '}
            <a href={'/auth/register'} className={styles['text-blue-700']}>
              here
            </a>{' '}
            to add your first user.
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      className={\`\${styles.grid} \${styles['h-screen']} \${styles['w-screen']} \${styles['place-items-center']} \${styles['px-4']} \${styles['text-sm']} \${styles['font-medium']}\`}
    >
      <div
        className={\`\${styles['w-full']} \${styles['max-w-sm']} \${styles['rounded-lg']} \${styles['shadow']}\`}
      >
        <div
          className={\`\${styles.flex} \${styles['flex-col']}  \${styles['items-center']} \${styles['justify-center']} \${styles['gap-4']}\`}
        >
          <img src='../tina.svg' alt='TinaCMS Logo' height={100} width={72} />
          {error && (
            <div
              className={\`\${styles['bg-red-500']} \${styles['text-white']} \${styles['rounded-md']} \${styles['p-3']}\`}
            >
              Sign In Failed [{error}]
            </div>
          )}
        </div>
        <form
          className={\`\${styles['p-6']}\`}
          method='post'
          action='/api/auth/callback/credentials'
        >
          <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
          <div className={\`\${styles['grid']} \${styles['gap-y-3']}\`}>
            <input
              name='username'
              className={\`\${styles['focus:border-purple-400']} \${styles['rounded-md']} \${styles['border']} \${styles['py-3']} \${styles['px-4']} \${styles['outline-none']} \${styles['transition']}}\`}
              placeholder='jsmith'
            />
            <input
              name='password'
              className={\`\${styles['focus:border-purple-400']} \${styles['rounded-md']} \${styles['border']} \${styles['py-3']} \${styles['px-4']} \${styles['outline-none']} \${styles['transition']}\`}
              type='password'
            />
            <button
              className={\`\${styles['flex']} \${styles['items-center']} \${styles['justify-center']} \${styles['gap-x-2']} \${styles['rounded-md']} \${styles['border']} \${styles['border-gray-300']} \${styles['bg-white']} \${styles['py-3']} \${styles['px-4']} \${styles['text-gray-700']} \${styles['transition']} \${styles['hover:text-purple-400']}\`}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { userStore } = await import('../../tina/auth')
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      error: context.query?.error || '',
      userSetupRequired: !(await userStore.isInitialized())
    }
  }
}
`,
  ['vercel-kv-credentials-provider-tailwindcss']:
    () => `/* THIS FILE HAS BEEN GENERATED WITH THE TINA CLI. */
/* Base Styles */
 .grid {
     display: grid;
}
 .place-items-center {
     place-items: center;
}
 .h-screen {
     height: 100vh;
}
 .w-screen {
     width: 100vw;
}
 .w-full {
     width: 100%;
}
/* Colors */
 .bg-slate-800 {
     background-color: #1e293b;
}
 .bg-gray-200 {
     background-color: #E1DDEC;
}
 .bg-slate-700\\/30 {
     background-color: rgba(30, 41, 59, 0.3);
}
 .bg-red-500 {
     --tw-bg-opacity: 1;
     background-color: rgb(244 63 94 / var(--tw-bg-opacity));
}
 .opacity-50 {
     opacity: 0.5;
}
 .cursor-not-allowed {
     cursor: not-allowed;
}
/* .hover:border-purple-400 {
     --tw-border-opacity: 1;
     border-color: rgba(139, 92, 246, var(--tw-border-opacity));
}
 */
 @media (hover) {
     .hover:border-purple-400 {
         --tw-border-opacity: 1;
         border-color: rgba(139, 92, 246, var(--tw-border-opacity));
    }
}
 .text-white {
     color: #ffffff;
}
 .text-purple-400 {
     color: #8b5cf6;
}
 .text-blue-700 {
     color: #3b82f6;
}
 .text-slate-200 {
     color: #a0aec0;
}
/* Spacing */
 .px-4 {
     padding-left: 1rem;
     padding-right: 1rem;
}
 .p-10 {
     padding: 2.5rem;
}
 .p-3 {
     padding: 0.75rem;
}
 .md\\:p-5 {
     padding: 1.25rem;
}
 .lg\\:p-6 {
     padding: 1.5rem;
}
 .py-3 {
     padding-top: 0.75rem;
     padding-bottom: 0.75rem;
}
/* Layout */
 .rounded-lg {
     border-radius: 0.5rem;
}
 .rounded-md {
     border-radius: 0.375rem;
}
 .max-w-sm {
     max-width: 24rem;
}
/* Flexbox */
 .flex {
     display: flex;
}
 .flex-col {
     flex-direction: column;
}
 .items-center {
     align-items: center;
}
 .justify-center {
     justify-content: center;
}
 .p-6 {
     padding: 1.5rem;
}
 .py-3 {
     padding-top: 0.75rem;
     padding-bottom: 0.75rem;
}
 .px-4 {
     padding-left: 1rem;
     padding-right: 1rem;
}
 .gap-4 {
     gap: 1rem;
}
 .gap-2 {
     gap: 0.5rem;
}
 .gap-y-3 {
     row-gap: 0.75rem;
}
 .gap-x-2 {
     column-gap: 0.5rem;
}
 .full {
     width: 100%;
}
 .max-w-sm {
     max-width: 24rem;
}
/* Forms */
 .form {
     display: block;
}
/* Inputs */
 .custom-input {
     display: block;
     width: 100%;
     line-height: 1.5;
     padding-top: 0.75rem;
     padding-bottom: 0.75rem;
     padding-left: 1rem;
     padding-right: 1rem;
     border-radius: 0.375rem;
     transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
 .shadow {
     --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
     --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
     box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
 .outline-none {
     outline: 0;
}
/* Borders */
 .border {
     border-width: 3px;
}
 .border-slate-600 {
     border-color: #4a5568;
}
/* Button */
 .custom-button {
     display: inline-block;
     text-align: center;
     line-height: 1.5;
     padding-top: 0.75rem;
     padding-bottom: 0.75rem;
     padding-left: 1rem;
     padding-right: 1rem;
     border-width: 1px;
     border-radius: 0.375rem;
     transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out;
     cursor: pointer;
     user-select: none;
}
/* Hover */
 .hover\\:text-purple-400:hover {
     color: #8b5cf6;
}
/* Focus */
 .focus\\:border-purple-400:focus {
     border-color: #8b5cf6;
}
/* Placeholder Text */
 .placeholder-text-slate-400::placeholder {
     color: #cbd5e0;
}
/* Image */
 .custom-img {
     display: inline-block;
     vertical-align: middle;
}
/* Gap */
 .gap-3 {
     gap: 0.75rem;
}
`,
}
