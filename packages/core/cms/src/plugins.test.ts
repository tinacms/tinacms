import { PluginManager } from './plugins'

describe('PluginManager', () => {
  describe('when nothing has been added', () => {
    describe('#all', () => {
      it('returns no items', () => {
        let plugins = new PluginManager()

        expect(plugins.all('test')).toHaveLength(0)
      })
    })
  })
  describe('when a "test" plugin has been added', () => {
    it('notifies the subscribers', () => {
      let listeners = [jest.fn(), jest.fn(), jest.fn(), jest.fn()]
      let p = { __type: 'test', name: 'Example' }
      let plugins = new PluginManager()
      listeners.forEach(listener =>
        plugins.findOrCreateMap('test').subscribe(listener)
      )

      plugins.add(p)

      listeners.forEach(listener => expect(listener).toHaveBeenCalled())
    })
    describe('#all', () => {
      it('contains the plugin', () => {
        let p = { __type: 'test', name: 'Example' }
        let plugins = new PluginManager()

        plugins.add(p)

        expect(plugins.all('test')).toContain(p)
      })
      it('returns no items of a different type', () => {
        let p = { __type: 'test', name: 'Example' }
        let plugins = new PluginManager()

        plugins.add(p)

        expect(plugins.all('different')).not.toContain(p)
      })
    })
  })
})
