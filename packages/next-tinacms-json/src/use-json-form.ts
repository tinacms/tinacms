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

import { useForm, useCMS, FormOptions, Form } from '@einsteinindustries/tinacms'
import { generateFields } from './generate-fields'

/**
 * A datastructure representing a JsonFile stored in Git
 */
export interface JsonFile<T = any> {
  fileRelativePath: string
  data: T
}

/**
 * Creates a TinaCMS Form for editing a JsonFile in Git
 */
export function useJsonForm<T = any>(
  jsonFile: JsonFile<T>,
  options: Partial<FormOptions<any>> = {}
): [T, Form] {
  const cms = useCMS()

  const id = options.id || jsonFile.fileRelativePath
  const label = options.label || jsonFile.fileRelativePath
  const fields = options.fields || generateFields(jsonFile)
  const actions = options.actions || []
  const buttons = options.buttons
  const [values, form] = useForm(
    {
      id,
      label,
      fields,
      actions,
      buttons,
      async loadInitialValues() {
        if (cms.disabled) return jsonFile.data
        return cms.api.git
          .show(jsonFile.fileRelativePath) // Load the contents of this file at HEAD
          .then((git: { content: string }) => {
            const jsonFileInGit = JSON.parse(git.content)

            return jsonFileInGit
          })
      },
      onSubmit() {
        return cms.api.git.commit({
          files: [jsonFile.fileRelativePath],
          message: `Commit from Tina: Update ${jsonFile.fileRelativePath}`,
        })
      },
      reset() {
        if (options.reset) {
          options.reset()
        }
        return cms.api.git.reset({ files: [id] })
      },
      onChange: formState => {
        if (options.onChange) {
          options.onChange(formState.values)
        }
        cms.api.git.writeToDisk({
          fileRelativePath: jsonFile.fileRelativePath,
          content: JSON.stringify(formState.values, null, 2),
        })
      },
    },
    { values: jsonFile.data, label }
  )

  return [values || jsonFile.data, form]
}
