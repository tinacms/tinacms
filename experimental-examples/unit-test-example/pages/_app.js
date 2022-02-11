import dynamic from 'next/dynamic'
import React from 'react'
import { TinaEditProvider } from 'tinacms/dist/edit-state'
import { useRouter } from 'next/router'

// @ts-ignore FIXME: default export needs to be 'ComponentType<{}>
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS
            cmsCallback={(cms) => {
              cms.flags.set('use-unstable-formify', true)
              return cms
            }}
            {...pageProps}
          >
            {(livePageProps) => {
              return (
                <>
                  <Nav />
                  <Component {...livePageProps} />
                </>
              )
            }}
          </TinaCMS>
        }
      >
        <>
          <Nav />
          <Component {...pageProps} />
        </>
      </TinaEditProvider>
    </>
  )
}

export default App

const Nav = () => {
  const paths = [
    'basic-query',
    'basic-query-with-aliases',
    'basic-query-with-reference',
    'collection-query',
    'collections-query',
    'generic-document',
    'with-aliases-in-list-object',
    'with-list',
    'with-reference-in-list-object',
    'with-reference-in-poly-object-list',
  ]
  const router = useRouter()

  return (
    <select
      onChange={(e) => {
        router.push(e.target.value)
      }}
    >
      {paths.map((p) => (
        <option key={p} selected={router.pathname === `/${p}`}>
          {p}
        </option>
      ))}
    </select>
  )
}
