import dynamic from 'next/dynamic'
import React from 'react'
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
