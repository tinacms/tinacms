/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Client } from './index'

describe('Tina Client', () => {
  describe('With localhost contentAPI URL', () => {
    let client: Client

    beforeEach(() => {
      client = new Client({
        clientId: '',
        branch: 'main',
        tokenStorage: 'LOCAL_STORAGE',
        customContentApiUrl: 'http://localhost:4001',
      })
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
      })
    })
    it('sets isLocalMode to false', () => {
      expect(client.isLocalMode).toEqual(false)
    })
  })
})
