import { databaseRequest } from '../../lib/databaseConnection'

export default async function handler(req, res) {
  const { query, variables } = req.body
  const result = await databaseRequest({ query, variables })
  return res.json(result)
}
