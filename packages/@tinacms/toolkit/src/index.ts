/**
 * Export @tinacms internal packages
 */
export * from '@/react-modals'
export type {
  Media,
  MediaUploadOptions,
  MediaStore,
  MediaListOptions,
  MediaList,
} from '@/core'
export { MdxFieldPluginExtendible } from '@/fields/plugins/mdx-field-plugin'
export {
  MediaManager,
  MediaListError,
  EventBus,
  DummyMediaStore,
  TinaMediaStore,
} from '@/core'
export * from '@/alerts'
export * from '@/styles'
export { useScreenPlugin } from '@/react-screens'
export type { ScreenPlugin } from '@/react-screens'
export * from '@/fields'
export * from '@/form-builder'
export type { ContentCreatorPlugin as AddContentPlugin } from '@/forms'
export type { ContentCreatorPlugin } from '@/forms'
export type { TinaState } from './tina-state'
export * from '@/forms'
export * from '@/icons'
export * from '@/react-dismissible'
export { Nav, LocalWarning, BillingWarning, SyncStatus } from '@/react-sidebar'

/**
 * Custom `tinacms` things
 */
export * from './react-tinacms'
export { TinaCMS } from './tina-cms'
export type { TinaCMSConfig } from './tina-cms'
export { GlobalFormPlugin } from '@/plugin-screens'
export { FormMetaPlugin } from '@/plugin-form-meta'
export * from '@/plugin-branch-switcher'
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
