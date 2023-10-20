import React, { Dispatch, SetStateAction, Suspense, useEffect } from 'react'
import TinaCMS, { TinaAdmin, useCMS, MdxFieldPluginExtendible } from 'tinacms'
import { TinaEditProvider, useEditState } from 'tinacms/dist/edit-state'
import { Preview } from './preview'
import Playground from './Playground'

// TODO: Resolve this to local file in tsconfig.json
// @ts-expect-error
import config from 'TINA_IMPORT'
// @ts-expect-error
import schemaJson from 'SCHEMA_IMPORT'
// @ts-expect-error
import staticMedia from 'STATIC_MEDIA_IMPORT'

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

const SetPreview = (props: {
  setBasePath?: Dispatch<SetStateAction<string>>
}) => {
  const cms = useCMS()
  React.useEffect(() => {
    // Override original 'rich-text' field with one that has raw mode support
    cms.fields.add({
      ...MdxFieldPluginExtendible,
      Component: Editor,
    })
    let basePath
    if (config.build.basePath) {
      basePath = config.build.basePath.replace(/^\/|\/$/g, '')
    }
    cms.flags.set(
      'tina-preview',
      `${basePath ? `${basePath}/` : ''}${config.build.outputFolder.replace(
        /^\/|\/$/g,
        ''
      )}`
    )
    props.setBasePath?.(cms.flags.get('tina-preview') || '')
  }, [props.setBasePath])
  return null
}

export const TinaAdminWrapper = () => {
  const schema = { ...config?.schema, config }
  const [basePath, setBasePath] = React.useState('')
  return (
    // @ts-ignore JSX element type 'TinaCMS' does not have any construct or call signatures.ts(2604)
    <TinaCMS
      {...config}
      schema={schema}
      client={{ apiUrl: __API_URL__ }}
      staticMedia={staticMedia}
      // THis will be replaced by the version of the graphql package or --garphql-version flag. It is replaced by vite at compile time
      tinaGraphQLVersion={__TINA_GRAPHQL_VERSION__}
    >
      <SetPreview setBasePath={setBasePath} />
      <TinaAdmin
        basePath={basePath}
        preview={Preview}
        Playground={Playground}
        config={config}
        schemaJson={schemaJson}
      />
    </TinaCMS>
  )
}

const GoToEdit = () => {
  const { setEdit } = useEditState()
  useEffect(() => {
    setEdit(true)
  }, [])
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
