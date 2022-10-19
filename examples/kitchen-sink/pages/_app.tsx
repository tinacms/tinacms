import '../styles/global.css'
import Slideover from '../components/slideover'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Slideover />
      <Component {...pageProps} />
    </>
  )
}
export default MyApp
