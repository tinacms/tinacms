import '../styles.css'
import { useEffect, useState } from 'react'

const App = ({ Component, pageProps }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // hack around hydration issues
  if (isClient) {
    return <Component {...pageProps} />
  }
}

export default App
