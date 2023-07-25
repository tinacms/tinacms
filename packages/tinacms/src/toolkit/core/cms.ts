/**
 * This package contains the [[CMS]] class which is the core
 * piece of any content management system.
 *
 * @packageDocumentation
 */

import { Plugin, PluginTypeManager } from './plugins'
import { EventBus } from './event'
import { MediaManager, MediaStore } from './media'
import { DummyMediaStore } from './media-store.default'
import { Flags } from './flags'

/**
 * A [[CMS]] is the core object of any content management system.
 *
 * The responsibility of the [[CMS]] keeps track of two broad types of objects:
 *
 * - [[Plugin|Plugins]] which extend or change the behaviour of the content management system..
 * - [[api|APIs]] which allow the CMS to integrate with third party services.
 * - [[EventBus|events]] which provide a way to communicate information about events happening
 *   between decoupled parts of the CMS.
 *
 * The name [[CMS]] is a bit misleading. This object knows nothing of the user
 * interface or the data storage layer. The purpose of a [[CMS]] instance is to
 * provide a common connection point for the various aspects of a content
 * management system. The [[CMS]] object effectively a vehicle for dependency injection.
 *
 * #### Creating a CMS
 *
 * ```ts
 * import { CMS } from "@tinacms/core"
 *
 * const cms = new CMS()
 * ```
 *
 * #### Extending the CMS
 *
 * The [[CMS]] class provides low-level interfaces for interacting with APIs and Plugins.
 * Creating a subclass is great way to facilitate these interactions:
 *
 * ```ts
 * import { CMS } from "@tinacms/core"
 *
 * class MyCMS extends CMS {
 *   get colors() {
 *     return this.plugins.findOrCreateMap("color")
 *   }
 * }
 *
 * const cms = new MyCMS()
 *
 * cms.colors.all()
 * ```
 */
export interface CMSConfig {
  enabled?: boolean
  plugins?: Array<Plugin>
  apis?: { [key: string]: any }
  media?: MediaStore
  /**
   * Might potentially make more sense to consolidate both media.store and mediaOptions.pageSize
   * under the 'media' config namespace, but that's a breaking change.
   */
  mediaOptions?: {
    pageSize?: number
  }
}

export class CMS {
  static ENABLED = { type: 'cms:enable' }
  static DISABLED = { type: 'cms:disable' }

  private _enabled: boolean = false

  /**
   * An object for managing CMSs plugins.
   *
   * [[Plugin|Plugins]] are used to extend or modify the CMSs feature set.
   *
   */
  plugins: PluginTypeManager

  /**
   * The set of APIs registered with the CMS.
   *
   * API objects are the preferred way to interact with external APIs over a network.
   *
   * The preferred way to register new APIs is through the [[registerApi]] method.
   *
   * #### Example: Fetching Data Through an API
   *
   * ```ts
   * import { CMS } from "@tinacms/core"
   * import { CoolApi } from "cool-api"
   *
   * const cms = new CMS()
   *
   * cms.registerApi("coolApi", new CoolApi())
   *
   * cms.api.coolApi.fetchCoolThings().then(coolThings => {
   *   console.log(coolThings)
   * })
   * ```
   *
   */
  api: { [key: string]: any } = {}
  private unsubscribeHooks: { [key: string]: () => void } = {}

  events = new EventBus()

  media = new MediaManager(new DummyMediaStore(), this.events)

  flags: Flags

  /**
   * @hidden
   */
  constructor(config: CMSConfig = {}) {
    this.plugins = new PluginTypeManager(this.events)
    this.flags = new Flags(this.events)

    if (config.media) {
      this.media.store = config.media
    } else {
      this.media.store = new DummyMediaStore()
    }

    if (config.mediaOptions && config.mediaOptions.pageSize) {
      this.media.pageSize = config.mediaOptions.pageSize
    }

    if (config.plugins) {
      config.plugins.forEach((plugin) => this.plugins.add(plugin))
    }

    if (config.apis) {
      Object.entries(config.apis).forEach(([name, api]) =>
        this.registerApi(name, api)
      )
    }

    if (config.enabled) {
      this.enable()
    }
  }

  /**
   * Registers a new external API with the CMS.
   *
   * #### Example
   *
   * ```ts
   * import { CoolApi } from "cool-api"
   *
   * cms.registerApi("coolApi", new CoolApi())
   * ```
   *
   * @param name The name used to lookup the external API.
   * @param api An object for interacting with an external API.
   *
   * ### Additional Resources
   *
   * * https://github.com/tinacms/rfcs/blob/master/0010-api-events.md
   */
  registerApi(name: string, api: any): void {
    if (this.unsubscribeHooks[name]) {
      this.unsubscribeHooks[name]()
    }
    if (api.events instanceof EventBus) {
      const unsubscribeHost = (api.events as EventBus).subscribe(
        '*',
        this.events.dispatch
      )
      const unsubscribeGuest = this.events.subscribe('*', (e) =>
        api.events.dispatch(e)
      )
      this.unsubscribeHooks[name] = () => {
        unsubscribeHost()
        unsubscribeGuest()
      }
    }
    this.api[name] = api
  }

  /**
   * When `true` the CMS is enabled and content can be edited.
   */
  get enabled(): boolean {
    return this._enabled
  }

  /**
   * When `true` the CMS is disabled and content cannot be edited.
   */
  get disabled(): boolean {
    return !this._enabled
  }

  /**
   * Enable the CMS so content can be edited.
   */
  enable = (): void => {
    this._enabled = true
    this.events.dispatch(CMS.ENABLED)
  }

  /**
   * Disable the CMS so content can no longer be edited.
   */
  disable = (): void => {
    this._enabled = false
    this.events.dispatch(CMS.DISABLED)
  }

  /**
   * Toggles the enabled/disabled state of the CMS .
   */
  toggle = (): void => {
    if (this.enabled) {
      this.disable()
    } else {
      this.enable()
    }
  }
}
