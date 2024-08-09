import type { Client } from 'tinacms'
import type { CloudinaryMediaStoreOptions } from './cloudinary-media-store'
import { CloudinaryMediaStore } from './cloudinary-media-store'

export const createTinaCloudCloudinaryMediaStore = (
  options: CloudinaryMediaStoreOptions = { baseUrl: '/api/cloudinary/media' }
) =>
  class TinaCloudCloudinaryMediaStore extends CloudinaryMediaStore {
    client: Client
    constructor(client: Client) {
      super(options)
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

export const TinaCloudCloudinaryMediaStore =
  createTinaCloudCloudinaryMediaStore()
