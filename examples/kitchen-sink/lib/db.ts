import { queries } from '../.tina/__generated__/types'
import database from '../.tina/database'
import { resolve } from '@tinacms/graphql'

export async function databaseRequest({ query, variables }) {
  return resolve({
    database,
    query,
    variables,
  })
}

export async function handlerRequest(req, res) {
  const { query, variables } = req.body
  const result = await databaseRequest({ query, variables })
  return res.json(result)
}

const request = async ({ query, variables }) => {
  const data = await databaseRequest({ query, variables })
  return { data: data.data as any, query, variables, errors: data.errors }
}

export const dbConnection = {
  request,
  queries: queries({
    request,
  }),
}
