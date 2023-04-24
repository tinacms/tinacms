/**

*/

import { Client, LocalClient } from './index'

describe('Tina Client', () => {
  describe('With localhost contentAPI URL', () => {
    let client: Client

    beforeEach(() => {
      client = new LocalClient()
    })
    it('sets isLocalMode', () => {
      expect(client.isLocalMode).toEqual(true)
    })
  })

  describe('With prod contentAPI URL', () => {
    let client: Client

    beforeEach(() => {
      client = new Client({
        clientId: '',
        branch: 'main',
        tokenStorage: 'LOCAL_STORAGE',
        customContentApiUrl: 'http://tina.io/fakeURL',
        tinaGraphQLVersion: '1.1',
      })
    })
    it('sets isLocalMode to false', () => {
      expect(client.isLocalMode).toEqual(false)
    })
  })
})
