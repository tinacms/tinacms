import dynamic from 'next/dynamic'
import React from 'react'
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const App = ({ Component, pageProps }) => {
  const { query, variables, data, ...rest } = pageProps
  return (
    <TinaCMS {...rest}>
      <Component {...rest} query={query} variables={variables} data={data} />
    </TinaCMS>
  )
}

export default App
