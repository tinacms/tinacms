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

import { Subscribable } from './subscribable'

export interface Plugin {
  __type: string
  name: string
  icon?: string
}

export class PluginManager {
  private plugins: Map<PluginType> = {}

  findOrCreateMap<T extends Plugin = Plugin>(type: T['__type']): PluginType<T> {
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

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export class PluginType<T extends Plugin = Plugin> extends Subscribable {
  __plugins: PluginMap<T> = {}
  constructor(private __type: string) {
    super()
  }

  add(plugin: T | Omit<T, '__type'>) {
    const p = plugin as T

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
    const name =
      typeof pluginOrName === 'string' ? pluginOrName : pluginOrName.name

    const plugin = this.__plugins[name]

    delete this.__plugins[name]
    this.notifiySubscribers()

    return plugin
  }
}
