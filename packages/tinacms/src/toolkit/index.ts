/**
 * Export @tinacms internal packages
 */
export * from '@toolkit/react-modals'
export type {
  Media,
  MediaUploadOptions,
  MediaStore,
  MediaListOptions,
  MediaList,
  StaticMedia,
} from '@toolkit/core'
export { MdxFieldPluginExtendible } from '@toolkit/fields/plugins/mdx-field-plugin'
export type { CloudConfigPlugin } from '@toolkit/react-cloud-config'
export type { Plugin } from '@toolkit/core'
export {
  MediaManager,
  MediaListError,
  EventBus,
  DummyMediaStore,
  TinaMediaStore,
} from '@toolkit/core'
export * from '@toolkit/alerts'
export * from '@toolkit/styles'
export { useScreenPlugin } from '@toolkit/react-screens'
export type { ScreenPlugin } from '@toolkit/react-screens'
export * from '@toolkit/fields'
export * from '@toolkit/form-builder'
export type { ContentCreatorPlugin as AddContentPlugin } from '@toolkit/forms'
export type { ContentCreatorPlugin } from '@toolkit/forms'
export type { TinaState } from './tina-state'
export * from '@toolkit/forms'
export * from '@toolkit/icons'
export * from '@toolkit/react-dismissible'
export {
  Nav,
  LocalWarning,
  BillingWarning,
  SyncStatus,
} from '@toolkit/react-sidebar'

export { useCMS } from '@toolkit/react-core'

/**
 * Custom `tinacms` things
 */
// export * from './react-tinacms'
export { TinaCMS } from './tina-cms'
export type { TinaCMSConfig } from './tina-cms'
export { GlobalFormPlugin } from '@toolkit/plugin-screens'
export { FormMetaPlugin } from '@toolkit/plugin-form-meta'
export * from '@toolkit/plugin-branch-switcher'
export {
  TinaProvider,
  // Deprecated aliases to the previous exports
  Tina,
} from './components/tina-provider'
export type { TinaProviderProps, TinaProps } from './components/tina-provider'
export { TinaCMSProvider } from './components/tina-cms-provider'
export type { TinaCMSProviderProps } from './components/tina-cms-provider'
export { TinaUI } from './components/tina-ui'
export type { TinaUIProps } from './components/tina-ui'

export { useLocalStorage } from './hooks/use-local-storage'
export { CursorPaginator } from './components/media/pagination'
export { DEFAULT_MEDIA_UPLOAD_TYPES } from './components/media'
