import type { Client } from 'tinacms'
import type { TinaCloudCloudinaryOptions } from './options'
import { createCloudinaryMediaStore } from './cloudinary-media-store'

export const createTinaCloudinaryMediaStore = (
  options: TinaCloudCloudinaryOptions = { baseURL: '/api/cloudinary/media' }
) =>
  class TinaCloudCloudinaryMediaStore extends createCloudinaryMediaStore(
    options
  ) {
    client: Client
    constructor(client: Client) {
      super()
      this.client = client
      this.fetchFunction = async (input: RequestInfo, init?: RequestInit) => {
        try {
          const url = input.toString()
          const query = `${url.includes('?') ? '&' : '?'}clientID=${
            client.clientId
          }`

          const res = client.authProvider.fetchWithToken(url + query, init)
          return res
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
