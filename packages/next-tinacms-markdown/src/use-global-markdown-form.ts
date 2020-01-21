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

import { MarkdownFile, useMarkdownForm, Options } from './use-markdown-form'
import { useMemo } from 'react'
import { GlobalFormPlugin, usePlugins } from 'tinacms'

/**
 * Registers a Global Form with TinaCMS for editing a Markdown File.
 */
export function useGlobalMarkdownForm(markdownFile: MarkdownFile, options?: Options) {
  const [values, form] = useMarkdownForm(markdownFile, options)
  const globalFormPlugin = useMemo(() => {
    if (form) {
      return new GlobalFormPlugin(form, null)
    }
  }, [form])

  usePlugins(globalFormPlugin)

  return [values, form]
}
