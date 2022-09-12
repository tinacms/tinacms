/**
Copyright 2021 Forestry.io Holdings, Inc.
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

import React from 'react'
import { TinaCMS, TinaCMSProvider, TinaUI } from 'tinacms'
import { Admin } from './Admin'

export const App = () => {
  const cms = React.useMemo(
    () =>
      new TinaCMS({
        enabled: true,
        sidebar: false,
      }),
    []
  )
  return (
    <div className="tina-tailwind">
      <TinaCMSProvider cms={cms}>
        <TinaUI />
        <Admin />
      </TinaCMSProvider>
    </div>
  )
}

export default App
