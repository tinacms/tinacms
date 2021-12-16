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

import { CMS } from './cms'
import { CMSEvent, EventBus } from './event'

describe('CMS', () => {
  describe('when constructed without options', () => {
    it('instantiates without error', () => {
      const cms = new CMS()

      expect(cms).toBeInstanceOf(CMS)
    })
    it('is disabled', () => {
      const cms = new CMS()

      expect(cms.disabled).toBe(true)
    })
  })
  describe('when constructed with options', () => {
    describe('without enabled set', () => {
      it('is disabled', () => {
        const options = {}

        const cms = new CMS(options)

        expect(cms.disabled).toBe(true)
      })
    })
    describe('with enabled set to `true`', () => {
      it('is enabled ', () => {
        const options = {
          enabled: true,
        }

        const cms = new CMS(options)

        expect(cms.enabled).toBe(true)
      })
    })
    describe('with enabled set to `false`', () => {
      it('is disabled', () => {
        const options = {
          enabled: false,
        }

        const cms = new CMS(options)

        expect(cms.disabled).toBe(true)
      })
    })
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

  describe('#registerApi', () => {
    describe('when the API has `events` of type EventBus', () => {
      it.skip('events dispatched to the API are also sent through the CMS', () => {
        const listener = jest.fn()
        const event: CMSEvent = { type: 'api:example' }
        const example = { events: new EventBus() }
        const cms = new CMS({ apis: { example } })
        cms.events.subscribe('*', listener)

        cms.api.example.events.dispatch(event)

        expect(listener).toHaveBeenCalledWith(event)
      })
    })
  })
})
