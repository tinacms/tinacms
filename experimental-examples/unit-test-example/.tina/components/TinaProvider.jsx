import TinaCMS from 'tinacms'
import schema, { tinaConfig } from '../schema.tsx'

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
/**
 *
 * @private Do not import this directly, please import the dynamic provider instead
 */
const TinaProvider = ({ children }) => {
  return (
    <TinaCMS {...tinaConfig} schema={schema}>
      {children}
    </TinaCMS>
  )
}

export default TinaProvider
