import { PluginTypeManager } from './plugins'
import { EventBus } from './event'
import { describe, it, test, expect, beforeEach, vi } from 'vitest'

describe('PluginTypeManager', () => {
  describe('when nothing has been added', () => {
    describe('#all', () => {
      it('returns no items', () => {
        const plugins = new PluginTypeManager(new EventBus())

        expect(plugins.all('test')).toHaveLength(0)
      })
    })
  })
  describe('when a "test" plugin has been added', () => {
    it('notifies the subscribers', () => {
      const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn()]
      const p = { __type: 'test', name: 'Example' }
      const plugins = new PluginTypeManager(new EventBus())
      listeners.forEach((listener) =>
        plugins.findOrCreateMap('test').subscribe(listener)
      )

      plugins.add(p)

      listeners.forEach((listener) => expect(listener).toHaveBeenCalled())
    })
    describe('#all', () => {
      it('contains the plugin', () => {
        const p = { __type: 'test', name: 'Example' }
        const plugins = new PluginTypeManager(new EventBus())

        plugins.add(p)

        expect(plugins.all('test')).toContain(p)
      })
      it('returns no items of a different type', () => {
        const p = { __type: 'test', name: 'Example' }
        const plugins = new PluginTypeManager(new EventBus())

        plugins.add(p)

        expect(plugins.all('different')).not.toContain(p)
      })
    })
  })
  describe('when a "test" plugin has been removed', () => {
    it('notifies the subscribers', () => {
      const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn()]
      const p = { __type: 'test', name: 'Example' }
      const plugins = new PluginTypeManager(new EventBus())
      plugins.add(p)

      listeners.forEach((listener) =>
        plugins.findOrCreateMap('test').subscribe(listener)
      )

      plugins.remove(p)

      listeners.forEach((listener) => expect(listener).toHaveBeenCalled())
    })
    describe('#all', () => {
      it('no longer contains the plugin', () => {
        const p = { __type: 'test', name: 'Example' }
        const plugins = new PluginTypeManager(new EventBus())

        plugins.add(p)
        expect(plugins.all('test')).toContain(p)

        plugins.remove(p)
        expect(plugins.all('test')).not.toContain(p)
      })
    })
  })
})
