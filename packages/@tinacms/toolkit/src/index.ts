/**

Copyright 2021 Forestry.io Holdings, Inc.

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
 * Export @tinacms internal packages
 */
export * from './packages/react-modals'
export type {
  Media,
  MediaUploadOptions,
  MediaStore,
  MediaListOptions,
  MediaList,
} from './packages/core'
export { MediaManager, MediaListError, EventBus } from './packages/core'
export * from './packages/alerts'
export * from './packages/styles'
export { useScreenPlugin } from './packages/react-screens'
export type { ScreenPlugin } from './packages/react-screens'
export * from './packages/fields'
export * from './packages/form-builder'
export type { ContentCreatorPlugin as AddContentPlugin } from './packages/forms'
export type { ContentCreatorPlugin } from './packages/forms'
export * from './packages/forms'
export * from './packages/icons'
export * from './packages/react-dismissible'

/**
 * Custom `tinacms` things
 */
export * from './react-tinacms'
export { TinaCMS } from './tina-cms'
export type { TinaCMSConfig } from './tina-cms'
export { GlobalFormPlugin } from './plugins/screens'
export { FormMetaPlugin } from './plugins/form-meta'
export * from './plugins/branch-switcher'
export {
  TinaProvider,
  // Deprecated aliases to the previous exports
  Tina,
} from './components/TinaProvider'
export type { TinaProviderProps, TinaProps } from './components/TinaProvider'
export { TinaCMSProvider } from './components/TinaCMSProvider'
export type { TinaCMSProviderProps } from './components/TinaCMSProvider'
export { TinaUI } from './components/TinaUI'
export type { TinaUIProps } from './components/TinaUI'
