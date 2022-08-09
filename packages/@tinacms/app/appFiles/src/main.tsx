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
import ReactDOM from 'react-dom/client'
// the user's actual schema
// @ts-ignore
import { tinaConfig } from 'TINA_IMPORT'
import TinaCMS, { TinaAdmin } from 'tinacms'
import { TinaEditProvider } from 'tinacms/dist/edit-state'

const App = () => {
  // TinaAdmin checks edit state, hence why it's still being wrapped by it
  // we should get ride of that check
  return (
    <>
      {/* @ts-ignore */}
      <TinaEditProvider
        editMode={
          // Stricter tsconfig in this package shows this error
          //@ts-ignore
          <TinaCMS {...tinaConfig}>
            <TinaAdmin />
          </TinaCMS>
        }
      ></TinaEditProvider>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
