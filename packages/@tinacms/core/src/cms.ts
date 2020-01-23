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
 * This package contains the [[CMS]] class which is the core
 * piece of any content management system.
 *
 * @packageDocumentation
 */

import { Plugin, PluginTypeManager } from './plugins'

/**
 * A [[CMS]] is the core object of any content management system.
 *
 * The responsibility of the [[CMS]] keeps track of two broad types of objects:
 *
 * - [[Plugin|Plugins]] which extend or change the behaviour of the content management system..
 * - [[api|APIs]] which allow the CMS to integrate with third party services.
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
  plugins?: Array<Plugin>
  apis?: { [key: string]: any }
}

export class CMS {
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

  /**
   * @hidden
   */
  constructor(config: CMSConfig | null = null) {
    this.plugins = new PluginTypeManager()

    if (config && config.plugins) {
      config.plugins.forEach(plugin => this.plugins.add(plugin))
    }

    if (config && config.apis) {
      Object.entries(config.apis).forEach(([name, api]) => this.registerApi(name, api))
    }
  }

  /**
   * Registers a new external API with the CMS.
   *
   * #### Example
   *
   *
   * ```ts
   * import { CoolApi } from "cool-api"
   *
   * cms.registerApi("coolApi", new CoolApi())
   * ```
   *
   * @param name The name used to lookup the external API.
   * @param api An object for interacting with an external API.
   */
  registerApi(name: string, api: any): void {
    // TODO: Make sure we're not overwriting an existing API.
    this.api[name] = api
  }
}
