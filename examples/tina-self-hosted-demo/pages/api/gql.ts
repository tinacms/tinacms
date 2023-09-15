import { databaseClient } from '../../tina/__generated__/databaseClient'
import { TinaNextAuthOptions, withNextAuthApiRoute } from 'tinacms-next-auth'

async function handler(req, res) {
  const { query, variables } = req.body
  const result = await databaseClient.request({ query, variables })
  return res.json(result)
}

export default withNextAuthApiRoute(handler, {
  authOptions: TinaNextAuthOptions({
    databaseClient,
    secret: process.env.NEXTAUTH_SECRET,
  }),
  disabled: process.env.TINA_PUBLIC_IS_LOCAL === 'true',
})
