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
 * Export @tinacms internal packages
 */
export * from '@tinacms/react-modals'
export {
  Media,
  MediaUploadOptions,
  MediaStore,
  MediaListOptions,
  MediaList,
  MediaManager,
} from '@tinacms/core'
export { ActionButton } from '@tinacms/react-forms'
export { ScreenPlugin, useScreenPlugin } from '@tinacms/react-screens'
export * from '@tinacms/fields'
export * from '@tinacms/form-builder'
export { ContentCreatorPlugin as AddContentPlugin } from '@tinacms/forms'
export { ContentCreatorPlugin } from '@tinacms/forms'

/**
 * Custom `tinacms` things
 */
export * from './react-tinacms'
export { TinaCMS, TinaCMSConfig } from './tina-cms'
export { GlobalFormPlugin } from './plugins/screens'
export {
  TinaProvider,
  TinaProviderProps,
  // Deprecated aliases to the previous exports
  Tina,
  TinaProps,
} from './components/TinaProvider'
export {
  TinaCMSProvider,
  TinaCMSProviderProps,
} from './components/TinaCMSProvider'
export { TinaUI, TinaUIProps } from './components/TinaUI'
export {
  MediaPaginatorPlugin,
  BaseMediaPaginator,
  MediaPaginatorProps,
} from './components/media'
