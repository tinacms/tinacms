import '../styles.css'
import dynamic from 'next/dynamic'
import { TinaEditProvider } from 'tinacms/dist/edit-state'
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const branch = 'main'
// When working locally, hit our local filesystem.
// On a Vercel deployment, hit the Tina Cloud API
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS
            apiURL={apiURL}
            // mediaStore={import('next-tinacms-cloudinary').then(
            //   ({ TinaCloudCloudinaryMediaStore }) =>
            //     TinaCloudCloudinaryMediaStore
            // )}
            // cmsCallback={(cms) => {
            //   import('react-tinacms-editor').then(({ MarkdownFieldPlugin }) => {
            //     cms.plugins.add(MarkdownFieldPlugin)
            //   })
            // }}
            // formifyCallback={({ formConfig, createForm, createGlobalForm }) => {
            //   if (formConfig.id === 'getGlobalDocument') {
            //     return createGlobalForm(formConfig)
            //   }

            //   return createForm(formConfig)
            // }}
          >
            <Component {...pageProps} />
          </TinaCMS>
        }
      >
        <Component {...pageProps} />
      </TinaEditProvider>
    </>
  )
}

export default App
