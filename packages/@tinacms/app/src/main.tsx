import React from 'react'
import ReactDOM from 'react-dom/client'
// This value is substituted by our plugin to use
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
      <TinaEditProvider
        editMode={
          // Stricter tsconfig in this package shows this error
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
