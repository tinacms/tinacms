import { databaseClient } from '../../tina/__generated__/databaseClient'
import { TinaAuthJSOptions, withAuthJSApiRoute } from 'tinacms-authjs'

async function handler(req, res) {
  const { query, variables } = req.body
  const result = await databaseClient.request({
    query,
    variables,
    user: req.session?.user,
  })
  return res.json(result)
}

export default withAuthJSApiRoute(handler, {
  authOptions: TinaAuthJSOptions({
    databaseClient,
    secret: process.env.NEXTAUTH_SECRET,
  }),
  disabled: process.env.TINA_PUBLIC_IS_LOCAL === 'true',
})
