/**

Copyright 2019 Forestry.io Inc

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

import { createAuthHandler } from './create-auth-handler'
import { ResStub } from '../test-helpers'

describe('createAuthHandler', () => {
  describe('without a signing key', () => {
    it('responds with status 500', async () => {
      // @ts-ignore That's the point of the test.
      const handler = createAuthHandler('test', 'test', undefined)
      const req = {}
      const res = new ResStub()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
    it('sends JSON response', async () => {
      // @ts-ignore That's the point of the test.
      const handler = createAuthHandler('test', 'test', undefined)
      const req = {}
      const res = new ResStub()

      await handler(req, res)

      expect(res.json).toHaveBeenCalled()
    })
  })
})
