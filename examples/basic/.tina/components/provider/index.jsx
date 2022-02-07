import dynamic from 'next/dynamic'
const TinaProvider = dynamic(() => import('./_TinaProvider'), { ssr: false })
import { TinaEditProvider } from 'tinacms/dist/edit-state'

const Tina = ({ children }) => {
  return (
    <>
      <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
        {children}
      </TinaEditProvider>
    </>
  )
}

export default Tina
