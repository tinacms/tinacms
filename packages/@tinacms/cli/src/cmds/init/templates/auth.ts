export type Variables = {
  nextAuthCredentialsProviderName?: string
}

type Keys = 'vercel-kv-credentials-provider'

export const templates: {
  [key in Keys]: (vars?: Variables) => string
} = {
  ['vercel-kv-credentials-provider']: (vars) => {
    return `import { RedisUserStore, TinaCredentialsProvider } from "tinacms-next-auth/dist/index";

const {
  NEXTAUTH_CREDENTIALS_KEY: authCollectionName,
  NEXTAUTH_SECRET: secret,
  KV_REST_API_URL: url,
  KV_REST_API_TOKEN: token
} = process.env

const userStore = new RedisUserStore(authCollectionName, { url, token })
const authOptions = {
  pages: {
    error: '/auth/signin', // Error code passed in query string as ?error=
    signIn: '/auth/signin',
  },
  secret,
  providers: [
    TinaCredentialsProvider({ name: '${vars.nextAuthCredentialsProviderName}', userStore })
  ],
}

export { authOptions, userStore }`
  },
}
