import { Subscribable } from './subscribable'

export class PluginManager extends Subscribable {
  private plugins: { [key: string]: { [key: string]: Plugin } } = {}

  constructor() {
    super()
  }
  add(view: Plugin) {
    let plugins = this.plugins[view.type] || {}
    plugins[view.name] = view
    this.plugins[view.type] = plugins
    this.notifiySubscribers()
  }
  remove(view: Plugin) {
    let plugins = this.plugins[view.type] || {}
    delete plugins[view.name]
    this.notifiySubscribers()
  }
  all<T extends Plugin = Plugin>(type: string): T[] {
    let plugins = this.plugins[type] || {}
    return Object.keys(plugins).map(key => this.plugins[type][key] as T)
  }
}

export interface Plugin {
  type: string
  name: string
}
