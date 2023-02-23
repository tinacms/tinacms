/**



*/

import * as React from 'react'
import { TinaProvider } from '../components/TinaProvider'
import { TinaCMS, TinaCMSConfig } from '../tina-cms'

export function withTina(Component: any, config?: TinaCMSConfig) {
  return (props: any) => {
    const cms = React.useMemo(() => new TinaCMS(config), [config])
    return (
      <TinaProvider cms={cms}>
        <Component {...props} />
      </TinaProvider>
    )
  }
}
