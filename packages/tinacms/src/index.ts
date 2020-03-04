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
 * TinaCMS Core Types & React Interfaces
 */
export * from './react-tinacms'

/**
 * The Tina CMS Class
 */
export { TinaCMS, TinaCMSConfig } from './tina-cms'
export { TinaCMS as CMS } from './tina-cms'

/**
 * Tina Sidebar
 */
export { Tina, TinaProps } from './components/Tina'
export { useSidebar } from './components/sidebar/SidebarProvider'

/**
 * Plugins
 */

// Plugin Types
export { AddContentPlugin } from './plugins/create-content-form-plugin'
export { GlobalFormPlugin } from './plugins/screens'
export { ScreenPlugin } from './plugins/screen-plugin'

// Pre-registered Plugins
export * from './plugins/fields'

/**
 * REACT COMPONENTS
 */

// Inline Editing Components
export * from '@tinacms/form-builder'

// Field/Input Component
export { Wysiwyg, Toggle, Select, NumberInput, Input } from '@tinacms/fields'
export { FieldMeta } from './plugins/fields/wrapFieldWithMeta'

// Modal Components
export * from './components/modals/ModalProvider'
export * from './components/modals/ModalPopup'
export * from './components/modals/ModalFullscreen'

// Form Actions Components
export { ActionButton } from './components/form/FormActions'

// Media Manager
export * from './media'
