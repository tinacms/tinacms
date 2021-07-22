---
'tinacms': patch
---

Use the default import from 'tinacms' to set up the Tina context:

```jsx
// pages/_app.js
import TinaCMS from 'tinacms'

const App = ({ Component, pageProps }) => {
  return (
    <TinaCMS
      // Required: The query from your `getStaticProps` request
      query={pageProps.query}
      // Required: The variables from your `getStaticProps` request
      variables={pageProps.variables} // Variables used in your query
      // Required: The data from your `getStaticProps` request
      data={pageProps.data}
      // Optional: Set to true when working with the local API
      isLocalClient={true}
      // Optional: When using Tina Cloud, specify the git branch
      branch="main"
      // Optional: Your identifier when connecting to Tina Cloud
      clientId="<some-id-from-tina-cloud>"
      // Optional: A callback for altering the CMS object if needed
      cms={(cms) => {}}
      // Optional: A callback for altering the form generation if needed
      formify={(args) => {}}
      // Optional: A callback for altering the document creator plugin
      documentCreator={(args) => {}}
    >
      {(livePageProps) => <Component {...livePageProps} />}
    </TinaCMS>
  )
}

export default App
```

To load TinaCMS dynamically, use the EditState context:

```jsx
// pages/_app.js
import dynamic from 'next/dynamic'
import { TinaEditProvider } from 'tinacms/dist/edit-state'
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const App({ Component, pageProps }) {
  return (
    <>
      <TinaEditProvider
        editMode={
          <TinaCMS {...pageProps}>
            {livePageProps => <Component {...livePageProps} />}
          </TinaCMS>
        }
      >
        <Component {...pageProps} />
      </TinaEditProvider>
    </>
  )
}

export default App
```
