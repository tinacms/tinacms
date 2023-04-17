import '../styles/global.css'
import Slideover from '../components/slideover'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Slideover />
      <Component {...pageProps} />
      <button
        className="absolute bottom-2 right-2 py-2 px-4 rounded-sm shadow-lg bg-gray-100 text-gray-600 uppercase tracking-widest text-sm font-bold z-20"
        type="button"
        onClick={() => {
          window.dispatchEvent(new Event('edit:enter'))
        }}
      >
        Edit
      </button>
    </>
  )
}
export default MyApp
