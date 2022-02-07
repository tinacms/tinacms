import TinaCMS from 'tinacms'

const branch = 'main'
// When working locally, hit our local filesystem.
// On a Vercel deployment, hit the Tina Cloud API
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
const TinaProvider = ({ children }) => {
  return (
    <TinaCMS
      apiURL={apiURL}
      cmsCallback={(cms) => {
        cms.flags.set('tina-admin', true)
      }}
    >
      {children}
    </TinaCMS>
  )
}

export default TinaProvider
