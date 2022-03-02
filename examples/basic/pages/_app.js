import Tina from '../.tina/components/TinaDynamicProvider.jsx'

const App = ({ Component, pageProps }) => {
  return (
    <Tina>
      <Component {...pageProps} />
    </Tina>
  )
}

export default App
