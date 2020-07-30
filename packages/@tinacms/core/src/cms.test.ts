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

import { CMS } from './cms'

describe('CMS', () => {
  describe('when constructed without options', () => {
    it('instantiates without error', () => {
      const cms = new CMS()

      expect(cms).toBeInstanceOf(CMS)
    })
  })
  describe('when constructed with options', () => {
    describe('containing a plugin', () => {
      it('will have the plugin', () => {
        const plugin = { __type: 'test', name: 'Example' }

        const cms = new CMS({
          plugins: [plugin],
        })

        expect(cms.plugins.all('test')).toContain(plugin)
      })
    })
    describe('containing an api', () => {
      it('will have that api', () => {
        const test = { foo: 'bar' }

        const cms = new CMS({
          apis: {
            test,
          },
        })

        expect(cms.api.test).toBe(test)
      })
    })
  })
})
