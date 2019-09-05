import { Subscribable } from './subscribable'

export interface Plugin {
  __type: string
  name: string
  icon?: string
}

export class PluginManager {
  private plugins: Map<PluginType> = {}

  findOrCreateMap<T extends Plugin = Plugin>(type: string): PluginType<T> {
    return (this.plugins[type] =
      this.plugins[type] || new PluginType(type)) as PluginType<T>
  }
  add(view: Plugin) {
    this.findOrCreateMap(view.__type).add(view)
  }
  remove(view: Plugin) {
    this.findOrCreateMap(view.__type).remove(view)
  }
  all<T extends Plugin = Plugin>(type: string): T[] {
    return this.findOrCreateMap<T>(type).all()
  }
}

interface Map<T> {
  [key: string]: T
}

type PluginMap<T extends Plugin = Plugin> = Map<T>

export class PluginType<T extends Plugin = Plugin> extends Subscribable {
  __plugins: PluginMap<T> = {}
  constructor(private __type: string) {
    super()
  }

  add(plugin: T | Omit<T, '__type'>) {
    let p = plugin as T

    if (!p.__type) {
      p.__type = this.__type
    }

    this.__plugins[p.name] = p
    this.notifiySubscribers()
  }

  all(): T[] {
    return Object.keys(this.__plugins).map(name => this.__plugins[name])
  }

  find(name: string): T | undefined {
    return this.__plugins[name]
  }

  remove(pluginOrName: string | T): T | undefined {
    let name =
      typeof pluginOrName === 'string' ? pluginOrName : pluginOrName.name

    let plugin = this.__plugins[name]

    delete this.__plugins[name]
    this.notifiySubscribers()

    return plugin
  }
}
