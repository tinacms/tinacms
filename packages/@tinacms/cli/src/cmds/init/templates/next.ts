/**

*/
export const nextPostPage = ({
  usingSrc,
}: {
  usingSrc: boolean
}) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
  // This is a demo file once you have tina setup feel free to delete this file

  import Head from 'next/head'
  import { useTina } from 'tinacms/dist/react'
  import { TinaMarkdown } from 'tinacms/dist/rich-text'
  import client from '${
    usingSrc ? '../' : ''
  }../../../tina/__generated__/client'

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
      <div className='relative py-16 bg-white overflow-hidden'>
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
  }`

export const authSigninPage =
  () => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import { getCsrfToken } from 'next-auth/react'

export default function SignIn({ csrfToken, error, userSetupRequired }) {
  if (userSetupRequired) {
    return (
      <div
        className='grid h-screen w-screen place-items-center bg-slate-800 px-4 text-sm font-medium'>
        <div className='w-full max-w-sm rounded-lg bg-slate-700/30 shadow'>
          <div className='flex flex-col items-center justify-center gap-4 p-10'>
            <img src='../tina.svg' alt='TinaCMS Logo' height={100} width={72}/>
            <div>User setup required. Click <a href={'/auth/register'} className={'text-blue-700'}>here</a> to add your first user.</div>
          </div>
        </div>
      </div>
    )
  }
  return (
      <div
        className='grid h-screen w-screen place-items-center bg-slate-800 px-4 text-sm font-medium'
      >
        <div className='w-full max-w-sm rounded-lg bg-slate-700/30 shadow'>
          <div className='flex flex-col items-center justify-center gap-4'>
            <img src='../tina.svg' alt='TinaCMS Logo' height={100} width={72}/>
            {error && (
              <div className='bg-red-500 text-white rounded-md p-3'>
                Sign In Failed [{error}]
              </div>
            )}
          </div>
          <form className='p-4 md:p-5 lg:p-6' method='post' action='/api/auth/callback/credentials'>
            <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
            <div className='grid gap-y-3'>
              <input
                name='username'
                className='focus:border-purple-400 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-200 outline-none transition placeholder:text-slate-400'
                placeholder='jsmith'
              />
              <input
                name='password'
                className='focus:border-purple-400 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-200 outline-none transition placeholder:text-slate-400'
                type='password'
              />
              <button
                className='flex items-center justify-center gap-x-2 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-300 transition hover:text-purple-400'
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
    },
  }
}
`

export const authRegisterPage = ({
  nextAuthCredentialsProviderName,
}: {
  nextAuthCredentialsProviderName: string
}) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'

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
        className={'grid h-screen w-screen place-items-center bg-slate-800 px-4 text-sm font-medium'}
      >
        {message}
      </div>
    )
  }

  const disabled = !username || !password || !confirmPassword || !userSetupRequired
  const buttonStyle = 
   'flex items-center justify-center gap-x-2 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-300 transition hover:text-purple-400 '
   + (disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400') 

  return (
    <div
      className='grid h-screen w-screen place-items-center bg-slate-800 px-4 text-sm font-medium'
    >
      <div className='w-full max-w-sm rounded-lg bg-slate-700/30 shadow'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <img src='../tina.svg' alt='TinaCMS Logo' height={100} width={72}/>
          {message && (
            <div className='bg-red-500 text-white rounded-md p-3'>
              Error: {message}
            </div>
          )}
        </div>
        <div className='p-4 md:p-5 lg:p-6'>
          <div className='grid gap-y-3'>
            <input
              className='focus:border-purple-400 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-200 outline-none transition placeholder:text-slate-400'
              placeholder='Enter username'
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              className='focus:border-purple-400 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-200 outline-none transition placeholder:text-slate-400'
              placeholder='Enter password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              className='focus:border-purple-400 rounded-md border border-slate-600 bg-slate-700 py-3 px-4 text-slate-200 outline-none transition placeholder:text-slate-400'
              placeholder='Confirm password'
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button
              className={buttonStyle}
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
}`

export const nextAuthApiHandler =
  () => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import NextAuth from 'next-auth'
import { authOptions } from "../../../tina/auth";

export default NextAuth(authOptions)
`

export const authRegisterApiHandler =
  () => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import { userStore } from "../../../tina/auth";

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
}
`
