/**

*/

import { DOSMediaStore } from './dos-media-store'
import type { Client } from 'tinacms'

export class TinaCloudDOSMediaStore extends DOSMediaStore {
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

        const res = client.fetchWithToken(url + query, init)
        return res
      } catch (error) {
        console.error(error)
      }
    }
  }
}
