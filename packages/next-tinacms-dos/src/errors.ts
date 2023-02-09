/**

*/

interface MediaListErrorConfig {
  title: string
  message: string
  docsLink: string
}

class MediaListError extends Error {
  public ERR_TYPE = 'MediaListError'
  public title: string
  public docsLink: string

  constructor(config: MediaListErrorConfig) {
    super(config.message)
    this.title = config.title
    this.docsLink = config.docsLink
  }
}
export const E_DEFAULT = new MediaListError({
  title: 'An Error Occurred',
  message: 'Something went wrong fetching your media from Digital Ocean Space.',
  docsLink: 'https://tina.io/packages/next-tinacms-dos',
})

export const E_UNAUTHORIZED = new MediaListError({
  title: 'Unauthorized',
  message: "You don't have access to this resource.",
  docsLink: 'https://tina.io/packages/next-tinacms-dos',
})

export const E_CONFIG = new MediaListError({
  title: 'Missing Credentials',
  message:
    'Unable to connect to Digital Ocean Space because one or more environment variables are missing.',
  docsLink: 'https://tina.io/docs/media-dos/',
})

export const E_KEY_FAIL = new MediaListError({
  title: 'Bad Credentials',
  message:
    'Unable to connect to Digital Ocean Space because one or more environment variables are misconfigured.',
  docsLink: 'https://tina.io/docs/media-dos/',
})

export const E_BAD_ROUTE = new MediaListError({
  title: 'Bad Route',
  message: 'The Digital Ocean Space API route is missing or misconfigured.',
  docsLink: 'https://tina.io/packages/next-tinacms-dos/#set-up-api-routes',
})

export const interpretErrorMessage = (message: string) => {
  switch (message) {
    case 'Must supply cloud_name':
    case 'Must supply api_key':
    case 'Must supply api_secret':
      return E_CONFIG
    case 'unknown api_key':
      return E_KEY_FAIL
    default:
      return E_DEFAULT
  }
}
