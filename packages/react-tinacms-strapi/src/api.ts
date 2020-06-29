import Cookies from 'js-cookie'
import { STRAPI_JWT } from './tina-strapi-client'

export async function fetchGraphql(query: string, variables = {}) {
  const jwt = Cookies.get(STRAPI_JWT)
  const headers: any = {
    'Content-Type': 'application/json',
  }

  if (jwt) headers['Authorization'] = `Bearer ${jwt}`

  const response = await fetch(`${process.env.STRAPI_URL}/graphql`, {
    method: 'post',
    headers: {
      ...headers,
    },
    body: JSON.stringify({ query: query, variables: variables }),
  })
  return response.json()
}
