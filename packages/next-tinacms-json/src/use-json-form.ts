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

import { useForm, useCMS, FormOptions, Field, Form } from 'tinacms'
import { generateFields } from './generate-fields'

/**
 * A datastructure representing a JsonFile stored in Git
 */
export interface JsonFile<T = any> {
  fileRelativePath: string
  data: T
}

export interface Options {
  id?: string
  label?: string
  fields?: Field[]
  actions?: FormOptions<any>['actions']
}
/**
 * Creates a TinaCMS Form for editing a JsonFile in Git
 */
export function useJsonForm<T = any>(
  jsonFile: JsonFile<T>,
  options: Options = {}
): [T, Form] {
  const cms = useCMS()

  const id = options.id || jsonFile.fileRelativePath
  const label = options.label || jsonFile.fileRelativePath
  const fields = options.fields || generateFields(jsonFile)
  const actions = options.actions || []
  const [values, form] = useForm(
    {
      id,
      label,
      fields,
      actions,
      loadInitialValues() {
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
        return cms.api.git.reset({ files: [id] })
      },
      onChange: formState => {
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
