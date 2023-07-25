import { databaseClient } from '../../tina/__generated__/databaseClient'

export default async function handler(req, res) {
  const { query, variables } = req.body
  const result = await databaseClient.request({ query, variables })
  return res.json(result)
}
