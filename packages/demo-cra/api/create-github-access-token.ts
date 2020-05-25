import { createAuthHandler } from 'next-tinacms-github'

export default createAuthHandler(
  process.env.APP_CLIENT_ID || '',
  process.env.APP_CLIENT_SECRET || ''
)
