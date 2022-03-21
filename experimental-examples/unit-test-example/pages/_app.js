import dynamic from 'next/dynamic'
import React from 'react'
import Tina from '../.tina/components/TinaProvider.jsx'

const App = ({ Component, pageProps }) => {
  const { query, variables, data, ...rest } = pageProps
  return (
    <Tina>
      <Component {...rest} query={query} variables={variables} data={data} />
    </Tina>
  )
}

export default App
