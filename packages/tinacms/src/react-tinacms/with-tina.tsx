/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

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
