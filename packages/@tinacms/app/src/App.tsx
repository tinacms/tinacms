import React, { Suspense } from 'react'
import TinaCMS, { TinaAdmin, useCMS, MdxFieldPluginExtendible } from 'tinacms'
import { TinaEditProvider, useEditState } from 'tinacms/dist/edit-state'
import { Preview } from './preview'

// TODO: Resolve this to local file in tsconfig.json
// @ts-expect-error
import config from 'TINA_IMPORT'
// @ts-expect-error
import schemaJson from 'SCHEMA_IMPORT'

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
      <TinaAdmin preview={Preview} config={config} schemaJson={schemaJson} />
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
