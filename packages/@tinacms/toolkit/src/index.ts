/**



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
export { MdxFieldPluginExtendible } from './packages/fields/plugins/MdxFieldPlugin'
export {
  MediaManager,
  MediaListError,
  EventBus,
  DummyMediaStore,
  TinaMediaStore,
} from './packages/core'
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
export {
  Nav,
  LocalWarning,
  BillingWarning,
  SyncStatus,
} from './packages/react-sidebar'

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

export { useLocalStorage } from './hooks/use-local-storage'
export { CursorPaginator } from './components/media/pagination'
