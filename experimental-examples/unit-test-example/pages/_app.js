import dynamic from 'next/dynamic'

// @ts-ignore FIXME: default export needs to be 'ComponentType<{}>
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const App = ({ Component, pageProps }) => {
  return (
    <TinaCMS {...pageProps}>
      {(livePageProps) => {
        return <Component {...livePageProps} />
      }}
    </TinaCMS>
  )
}

export default App
