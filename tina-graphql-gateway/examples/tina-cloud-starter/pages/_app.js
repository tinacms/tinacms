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
import Link from 'next/link'

import { EditProvider, useEditState } from 'tina-graphql-gateway'

// InnerApp that handles rendering edit mode or not
function InnerApp({ Component, pageProps }) {
  const { edit } = useEditState()
  if (edit) {
    // Dynamically load Tina only when in edit mode so it does not affect production
    // see https://nextjs.org/docs/advanced-features/dynamic-import#basic-usage
    const TinaWrapper = dynamic(() => import('../components/tina-wrapper'))
    return (
      <>
        <TinaWrapper {...pageProps}>
          {(props) => <Component {...props} />}
        </TinaWrapper>
        <EditToggle isInEditMode={true} />
      </>
    )
  }
  return (
    <>
      <Component {...pageProps} />
      <EditToggle isInEditMode={true} />
    </>
  )
}

const EditToggle = (isInEditMode) => {
  const { edit, setEdit } = useEditState()
  return (
    <>
      {(Number(process.env.NEXT_PUBLIC_SHOW_EDIT_BTN) || edit) && (
        <>
          <button
            onClick={() => {
              setEdit(!edit)
            }}
            className="editLink"
          >
            {edit ? 'Exit edit mode' : 'Enter edit mode'}
          </button>
          <style jsx>{`
            .editLink {
              border: none;
              position: fixed;
              top: 0;
              right: 0;
              background: var(--orange);
              color: var(--white);
              padding: 0.5rem 0.75rem;
              font-weight: bold;
              text-decoration: none;
              display: inline-block;
              border-bottom-left-radius: 0.5rem;
              cursor: pointer;
              font-size: 20px;
            }
          `}</style>
        </>
      )}
    </>
  )
}

// Our app is wrapped with edit provider
function App(props) {
  return (
    <EditProvider>
      <InnerApp {...props} />
    </EditProvider>
  )
}

export default App
