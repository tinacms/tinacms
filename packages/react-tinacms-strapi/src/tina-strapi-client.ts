export const STRAPI_JWT = 'tina_strapi_jwt'

export class TinaStrapiClient {
  async authenticate(username: string, password: string) {
    return fetch(`${process.env.STRAPI_URL}/auth/local`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, password: password }),
    })
  }
}
