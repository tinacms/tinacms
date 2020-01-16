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

import { PluginTypeManager } from './plugins'

describe('PluginTypeManager', () => {
  describe('when nothing has been added', () => {
    describe('#all', () => {
      it('returns no items', () => {
        const plugins = new PluginTypeManager()

        expect(plugins.all('test')).toHaveLength(0)
      })
    })
  })
  describe('when a "test" plugin has been added', () => {
    it('notifies the subscribers', () => {
      const listeners = [jest.fn(), jest.fn(), jest.fn(), jest.fn()]
      const p = { __type: 'test', name: 'Example' }
      const plugins = new PluginTypeManager()
      listeners.forEach(listener =>
        plugins.findOrCreateMap('test').subscribe(listener)
      )

      plugins.add(p)

      listeners.forEach(listener => expect(listener).toHaveBeenCalled())
    })
    describe('#all', () => {
      it('contains the plugin', () => {
        const p = { __type: 'test', name: 'Example' }
        const plugins = new PluginTypeManager()

        plugins.add(p)

        expect(plugins.all('test')).toContain(p)
      })
      it('returns no items of a different type', () => {
        const p = { __type: 'test', name: 'Example' }
        const plugins = new PluginTypeManager()

        plugins.add(p)

        expect(plugins.all('different')).not.toContain(p)
      })
    })
  })
  describe('when a "test" plugin has been removed', () => {
    it('notifies the subscribers', () => {
      const listeners = [jest.fn(), jest.fn(), jest.fn(), jest.fn()]
      const p = { __type: 'test', name: 'Example' }
      const plugins = new PluginTypeManager()
      plugins.add(p)

      listeners.forEach(listener =>
        plugins.findOrCreateMap('test').subscribe(listener)
      )

      plugins.remove(p)

      listeners.forEach(listener => expect(listener).toHaveBeenCalled())
    })
    describe('#all', () => {
      it('no longer contains the plugin', () => {
        const p = { __type: 'test', name: 'Example' }
        const plugins = new PluginTypeManager()

        plugins.add(p)
        expect(plugins.all('test')).toContain(p)

        plugins.remove(p)
        expect(plugins.all('test')).not.toContain(p)
      })
    })
  })
})
