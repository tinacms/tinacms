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

import React, { Suspense } from 'react'
import TinaCMS, { TinaAdmin, useCMS, MdxFieldPluginExtendible } from 'tinacms'
import { TinaEditProvider, useEditState } from 'tinacms/dist/edit-state'
import { Preview } from './preview'

// TODO: Resolve this to local file in tsconfig.json
// @ts-expect-error
import config from 'TINA_IMPORT'

const RawEditor = React.lazy(() => import('./fields/rich-text'))

const Editor = (props) => {
  const [rawMode, setRawMode] = React.useState(false)
  return (
    <MdxFieldPluginExtendible.Component
      rawMode={rawMode}
      setRawMode={setRawMode}
      {...props}
      rawEditor={
        <Suspense fallback={<div>Loading raw editor...</div>}>
          <RawEditor {...props} setRawMode={setRawMode} rawMode={rawMode} />
        </Suspense>
      }
    />
  )
}

const SetPreview = ({ outputFolder }: { outputFolder: string }) => {
  const cms = useCMS()
  cms.flags.set('tina-preview', outputFolder)
  // Override original 'rich-text' field with one that has raw mode support
  cms.fields.add({
    ...MdxFieldPluginExtendible,
    Component: Editor,
  })
  return null
}

export const TinaAdminWrapper = () => {
  const schema = { ...config?.schema, config }
  return (
    // @ts-ignore JSX element type 'TinaCMS' does not have any construct or call signatures.ts(2604)
    <TinaCMS {...config} schema={schema} client={{ apiUrl: __API_URL__ }}>
      <SetPreview outputFolder={config.build.outputFolder} />
      <TinaAdmin preview={Preview} config={config} />
    </TinaCMS>
  )
}

const GoToEdit = () => {
  const { setEdit } = useEditState()
  setEdit(true)
  return <div>Going into edit mode</div>
}

function App() {
  return (
    <TinaEditProvider editMode={<TinaAdminWrapper />}>
      <GoToEdit />
    </TinaEditProvider>
  )
}
export default App
