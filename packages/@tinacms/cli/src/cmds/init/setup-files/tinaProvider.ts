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

export const TinaProvider = `import TinaCMS from 'tinacms'
import { tinaConfig } from '../schema.ts'

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
/**
 *
 * @private Do not import this directly, please import the dynamic provider instead
 */
const TinaProvider = ({ children }) => {
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>
}

export default TinaProvider
`

export const TinaProviderDynamic = `import dynamic from 'next/dynamic'
const TinaProvider = dynamic(() => import('./TinaProvider'), { ssr: false })
import { TinaEditProvider } from 'tinacms/dist/edit-state'

const DynamicTina = ({ children }) => {
  return (
    <>
      <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
        {children}
      </TinaEditProvider>
    </>
  )
}

export default DynamicTina
`
