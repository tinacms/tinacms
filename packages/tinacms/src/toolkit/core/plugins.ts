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

import { EventBus, Callback } from './event'

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
 * Manages all of the [[PluginType|PluginTypes]] on a [[CMS]].
 */
export class PluginTypeManager {
  /**
   * @ignore
   */
  private plugins: Map<PluginType> = {}

  constructor(private events: EventBus) {}

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
  getType<P extends Plugin = Plugin>(type: P['__type']): PluginType<P> {
    return (this.plugins[type] =
      this.plugins[type] || new PluginType(type, this.events)) as PluginType<P>
  }

  /**
   * An alias to [[get]]
   *
   * ### !DEPRECATED!
   *
   * This name is unnecessarily verbose and weird.
   */
  findOrCreateMap<P extends Plugin = Plugin>(type: P['__type']): PluginType<P> {
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
  remove<P extends Plugin = Plugin>(plugin: P) {
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

/**
 * A collection of plugins with the same `__type` value.
 */
export class PluginType<T extends Plugin = Plugin> {
  /**
   * @ignore
   */
  __plugins: PluginMap<T> = {}

  /**
   *
   * @param __type The `__type` of plugin being managed.
   */
  constructor(private __type: string, private events: EventBus) {}

  /**
   * Adds a new plugin to the collection.
   *
   * ### Example
   *
   * ```ts
   * interface ColorPlugin extends Plugin {
   *   hex: string
   * }
   *
   * const colorPlugins = new PluginType<ColorPlugin>("color")
   *
   * colorPlugins.add({ name: "red", hex: "#f00" })
   * ```
   *
   * @param plugin A new plugin. The `__type` is optional and will be added if it's missing.
   */
  add(plugin: T | Omit<T, '__type'>) {
    const p = plugin as T

    if (!p.__type) {
      p.__type = this.__type
    }

    this.__plugins[p.name] = p
    this.events.dispatch({ type: `plugin:add:${this.__type}` })
  }

  all(): T[] {
    return Object.keys(this.__plugins).map((name) => this.__plugins[name])
  }

  /**
   *
   * Looks up a plugin by it's `name`.
   *
   * ### Example
   *
   * ```ts
   * const colorPlugins = new PluginType<ColorPlugin>("color")
   *
   * colorPlugins.add({ name: "red", hex: "#f00" })
   *
   * colorPlugins.find("red")  // { __type: "color", name: "red", hex: "#f00" }
   * colorPlugin.find("large") // undefined
   * ```
   *
   * @param name The `name` of the plugin to be retrieved.
   */
  find(name: string): T | undefined {
    return this.__plugins[name]
  }

  /**
   * Pass this function a plugin or the `name` of a plugin to have
   * it be removed from the CMS.
   *
   * @param pluginOrName The `name` of a plugin, or the plugin itself.
   * @returns The plugin that was removed, or `undefined` if it was not found.
   */
  remove(pluginOrName: string | T): T | undefined {
    const name =
      typeof pluginOrName === 'string' ? pluginOrName : pluginOrName.name

    const plugin = this.__plugins[name]

    delete this.__plugins[name]
    this.events.dispatch({ type: `plugin:remove:${this.__type}` })

    return plugin
  }
  subscribe(cb: Callback): () => void {
    return this.events.subscribe(`plugin:*:${this.__type}`, cb)
  }
}
