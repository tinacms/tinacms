/**

*/

import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common'

/**
 * This plugin generate a generic SDK (without any Requester implemented), allow you to easily customize the way you fetch your data, without loosing the strongly-typed integration.
 */
export interface RawGenericSdkPluginConfig
  extends RawClientSideBasePluginConfig {
  /**
   * usingObservableFrom: "import Observable from 'zen-observable';"
   * OR
   * usingObservableFrom: "import { Observable } from 'rxjs';"
   */
  usingObservableFrom?: string
}
