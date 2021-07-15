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

import dynamic from 'next/dynamic'
import '../styles.css'

import { EditProvider, useEditState } from '../utils/editState'

// InnerApp that handles rendering edit mode or not
function InnerApp({ Component, pageProps }) {
  const { edit, setEdit } = useEditState()
  if (edit) {
    // Dynamically load Tina only when in edit mode so it does not affect production
    // see https://nextjs.org/docs/advanced-features/dynamic-import#basic-usage
    const TinaWrapper = dynamic(() => import('../components/tina-wrapper'))
    return (
      <>
        <TinaWrapper {...pageProps}>
          {(props) => (
            <>
              <div>
                <button
                  onClick={() => {
                    setEdit(false)
                  }}
                >
                  Exit Edit mode
                </button>
              </div>
              <Component {...props} />
            </>
          )}
        </TinaWrapper>
      </>
    )
  }
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}

// Our app is wrapped with edit provider
function App(props) {
  return (
    <EditProvider>
      {/* TinaProvider is needed until the theme is moved to tina cloud */}
      {/* <TinaProvider cms={new TinaCMS({ enabled: false })}> */}
      <InnerApp {...props} />
      {/* </TinaProvider> */}
    </EditProvider>
  )
}

export default App
