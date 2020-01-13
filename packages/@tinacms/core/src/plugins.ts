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

/**
 * An object used to extend or modify the behaviour of the content management system.
 */
export interface Plugin {
  /**
   * Used to organize plugins with a common purpose.
   */
  __type: string
  /**
   * A unique identifier for the plugin.
   *
   * @todo Rename to `id`.
   */
  name: string
  /**
   * A string referencing an icon.
   *
   * ### !DEPRECATED!
   *
   * This shouldn't be here. Please assume it isn't.
   */
  icon?: string
}

/**
 * This class keeps track of all the different types of [[Plugin|plugins]]
 * used in the [[CMS]].
 */
export class PluginManager {
  /**
   * @ignore
   */
  private plugins: Map<PluginType> = {}

  /**
   * Gets the [[PluginType|collection of plugins]] for the given type.
   *
   * #### Example: Basic Usage
   *
   * ```ts
   * const colorPlugins = cms.plugins.get("color")
   * ```
   *
   * #### Example: Advanced Types
   *
   * A type param can be added to specify the kind of [[Plugin]]
   * that is being listed.
   *
   * ```ts
   * const colorPlugins = cms.plugins.get<ColorPlugin>("color")
   * ```
   *
   * @param type The type of plugins to be retrieved
   * @typeparam P A subclass of [[Plugin]]
   */
  get<P extends Plugin = Plugin>(type: P['__type']): PluginType<P> {
    return (this.plugins[type] =
      this.plugins[type] || new PluginType(type)) as PluginType<P>
  }

  /**
   * An alias to [[get]]
   *
   * ### !DEPRECATED!
   *
   * This name is unnecessarily verbose and weird.
   */
  findOrCreateMap<P extends Plugin = Plugin>(type: P['__type']): PluginType<P> {
    return this.get(type)
  }

  /**
   * Adds a [[Plugin]] to the [[CMS]].
   *
   * #### Example: Basic Usage
   *
   * ```js
   * cms.plugins.add({ __type: "color", name: "red" })
   * ```
   *
   * #### Example: Advanced Types
   *
   * ```ts
   * interface ColorPlugin extends Plugin {
   *   __type: "color"
   *   hex: string
   *   rgb: string
   * }
   *
   * cms.plugins.add<ColorPlugin>({
   *   __type: "color",
   *   name: "red",
   *   hex: "#FF0000",
   *   rgb: "RGBA(255, 0, 0, 1)"
   * })
   * ```
   *
   * @typeparam P
   * @param plugin
   * @todo Consider returning the plugin which was just added.
   */
  add<P extends Plugin = Plugin>(plugin: P) {
    this.findOrCreateMap(plugin.__type).add(plugin)
  }

  /**
   * Removes the given [[Plugin|plugin]] from the [[CMS]].
   *
   * #### Example: Basic Usage
   *
   * In this example a plugin is added to the [[CMS]] and removed
   * 5 seconds later.
   *
   * ```ts
   * const redPlugin = {
   *   __type: "color",
   *   name: "red",
   *   hex: "#FF0000",
   *   rgb: "RGBA(255, 0, 0, 1)"
   * }
   *
   * cms.plugins.add(redPlugin)
   *
   * setTimeout(() => {
   *   cms.plugins.remove(redPlugin)
   * }, 5000)
   * ```
   *
   * @typeparam P A subclass of [[Plugin]]
   * @param plugin The plugin to be removed from the CMS.
   */
  remove<P extends Plugin = Plugin>(plugin: P) {
    this.findOrCreateMap(plugin.__type).remove(plugin)
  }

  /**
   * Returns a list of all the [[Plugin|plugins]] of the given type.
   *
   * #### Example: Basic Usage
   *
   * ```ts
   * cms.plugins.all("color").forEach(color => {
   *   console.log(color.name)
   * })
   * ```
   *
   * #### Example: Advanced Types
   *
   * A type param can be added to specify the kind of [[Plugin]]
   * that is being listed.
   *
   * ```ts
   * cms.plugins.all<ColorPlugin>("color").forEach(color => {
   *   console.log(color.name, color.hex)
   * })
   * ```
   *
   * @returns A list of all the [[Plugin|plugins]] of the given type.
   * @param type The name of the plugin
   */
  all<P extends Plugin = Plugin>(type: string): P[] {
    return this.findOrCreateMap<P>(type).all()
  }
}

/**
 * @ignore
 */
interface Map<T> {
  [key: string]: T
}

/**
 * @ignore
 */
type PluginMap<T extends Plugin = Plugin> = Map<T>

export class PluginType<T extends Plugin = Plugin> extends Subscribable {
  /**
   * @ignore
   */
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
