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

export * from './components'
export * from './plugins'
// TODO: Move this into components
export * from './plugins/wrapFieldWithMeta'
/**
 *
 * wrapFieldsWithMeta uses this type under the hood, but it doesn't
 * export it so downstream compilations don't know what FieldProps is
 *
 * see discussion: https://github.com/microsoft/TypeScript/issues/5711#issuecomment-157793294
 */
export { FieldProps } from './plugins/fieldProps'
