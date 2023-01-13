import database from '../../.tina/database'
import { resolve } from '@tinacms/graphql'

export default async function handler(req, res) {
  const { query, variables } = req.body
  const config = {
    useRelativeMedia: true,
  }

  const result = await resolve({
    config,
    database,
    query,
    variables,
    verbose: true,
  })

  return res.json(result)
}
