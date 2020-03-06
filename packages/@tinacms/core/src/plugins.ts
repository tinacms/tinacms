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

/**
 * This package defines the plugin system of TinaCMS.
 *
 * The management of plugins is a core part of a content
 * management system. The API for managing plugins in TinaCMS is quite
 * powerful, although the implementation is a bit awkward.
 *
 * [[Plugin|Plugins]] are objects used to extend and modify the
 * behaviour of the CMS. Each plugin has a `__type` field that is used
 * to group plugins by their purpose.
 *
 * The [[PluginType]] class is responsible for managing a collection of
 * plugins with the same `__type` value. Plugins can be added and removed from
 * the `PluginType` over the life of the application.
 *
 * A new [[CMS]] is not initialized with any `PluginTypes`.
 * Instead it has a single [[PluginTypeManager]] which is responsible for
 * creating and managing different `PluginType` instances.
 *
 * Although somewhat confusing from the maintainers perspective, this
 * structure results in a pretty easy to use interface for the clients.
 * The concept of `PluginType` and `PluginTypeManager` are not really
 * meant to be exposed to developers using TinaCMS in their projects.
 *
 * @packageDocumentation
 */

import { createCollection, Collection } from 'babas'

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

export interface PluginCollectionMethods<Plugin> {
  find(name: string): Plugin | undefined
  all(): Plugin[]
  add(plugin: Omit<Plugin, '__type'>): Plugin
  remove(plugin: Omit<Plugin, '__type'>): void
}

export type PluginCollection<P extends Plugin = Plugin> = Collection<
  P,
  PluginCollectionMethods<P>
>

/**
 * Manages all of the [[PluginType|PluginTypes]] on a [[CMS]].
 */
export class PluginTypeManager {
  /**
   * @ignore
   */
  private plugins: Map<PluginCollection> = {}

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
   * A type param can be added to specify the kind of Plugin
   * that is being listed.
   *
   * ```ts
   * const colorPlugins = cms.plugins.get<ColorPlugin>("color")
   * ```
   *
   * @param type The type of plugins to be retrieved
   * @typeparam P A subclass of Plugin. Optional.
   */
  getType<P extends Plugin = Plugin>(type: P['__type']): PluginCollection<P> {
    return (this.plugins[type] =
      this.plugins[type] ||
      createCollection<Plugin, PluginCollectionMethods<Plugin>>(
        {},
        plugins => ({
          add(plugin: Omit<Plugin, '__type'>) {
            return (plugins[plugin.name] = { ...plugin, __type: type })
          },
          remove(plugin: Plugin) {
            delete plugins[plugin.name]
          },
          find(name: string) {
            return plugins[name]
          },
          all() {
            return plugins.toArray()
          },
        })
      )) as PluginCollection<P>
  }

  /**
   * An alias to [[get]]
   *
   * ### !DEPRECATED!
   *
   * This name is unnecessarily verbose and weird.
   */
  findOrCreateMap<P extends Plugin = Plugin>(type: P['__type']) {
    return this.getType(type)
  }

  /**
   * Adds a Plugin to the CMS.
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
   * @typeparam P A subclass of Plugin. Optional.
   * @param plugin
   * @todo Consider returning the plugin which was just added.
   */
  add<P extends Plugin = Plugin>(plugin: P) {
    this.findOrCreateMap(plugin.__type).add(plugin)
  }

  /**
   * Removes the given plugin from the CMS.
   *
   * #### Example
   *
   * In this example a plugin is added to the CMS and removed
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
   * @typeparam P A subclass of Plugin. Optional.
   * @param plugin The plugin to be removed from the CMS.
   */
  remove<P extends Plugin = Plugin>(plugin: P): void {
    this.findOrCreateMap(plugin.__type).remove(plugin)
  }

  /**
   * Returns a list of all the plugins of the given type.
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
   * A generic can be added to specify the type of plugins
   * that are being retrieved.
   *
   * ```ts
   * cms.plugins.all<ColorPlugin>("color").forEach(color => {
   *   console.log(color.name, color.hex)
   * })
   * ```
   *
   * @typeparam P A subclass of Plugin. Optional.
   * @param type The name of the plugin
   * @returns An array of all plugins of the given type.
   */
  all<P extends Plugin = Plugin>(type: string): P[] {
    return this.findOrCreateMap<P>(type).toArray() as P[]
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
