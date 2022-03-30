import Tina from 'tinacms'
import { tinaConfig } from '../.tina/schema'

const TinaLoader = ({ pageProps, children }) => {
  // @ts-ignore Types of property 'query' are incompatible. Type 'string' is not assignable to type 'never'
  return <Tina {...tinaConfig}>{children}</Tina>
}

export default TinaLoader
