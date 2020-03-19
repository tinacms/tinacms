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

function mergeDefaultConfig(config?: TinaCMSConfig) {
  // TODO maybe use lodash/fp/defaultsDeep
  // Using lodash/fp libs requires installing all of lodash so requires consideration
  const merge = require('lodash.merge')
  const cloneDeep = require('lodash.clonedeep')
  return merge(
    {
      plugins: [],
      apis: {},
      sidebar: {
        position: 'displace',
        hidden: false,
      },
    },
    cloneDeep(config)
  )
}

export function withTina(Component: any, config?: TinaCMSConfig) {
  return (props: any) => {
    const safeConfig = React.useMemo(() => mergeDefaultConfig(config), [config])
    const cms = React.useMemo(() => new TinaCMS(safeConfig), [safeConfig])
    return (
      <TinaProvider cms={cms} {...safeConfig.sidebar}>
        <Component {...props} />
      </TinaProvider>
    )
  }
}
