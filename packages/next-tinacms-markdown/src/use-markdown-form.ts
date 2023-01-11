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

const matter = require('gray-matter')

// import * as yaml from 'js-yaml'
import { useForm, useCMS, FormOptions } from '@einsteinindustries/tinacms'
import { generateFields } from './generate-fields'

/**
 * A datastructure representing a MarkdownFile stored in Git
 */

export interface MarkdownFile {
  fileRelativePath: string
  frontmatter: any
  markdownBody: string
}

export function toMarkdownString(markdownFile: MarkdownFile) {
  console.debug(markdownFile)
  throw new Error(
    'I disabled this, this package does not have js-yaml install even though it requires it for some reason. ' +
      'Find me in packages/next-tinacms-markdown/src/use-markdown-form.ts(21,23)'
  )
  // return (
  //   '---\n' +
  //   yaml.dump(markdownFile.frontmatter) +
  //   '---\n' +
  //   (markdownFile.markdownBody || '')
  // )
}
/**
 * Creates a TinaCMS Form for editing a MarkdownFile in Git
 */
export function useMarkdownForm(
  markdownFile: MarkdownFile,
  options: Partial<FormOptions<any>> = {}
) {
  const cms = useCMS()

  const valuesOnDisk = markdownFile

  const id = options.id || markdownFile.fileRelativePath
  const label = options.label || markdownFile.fileRelativePath
  const fields = options.fields || generateFields(markdownFile)
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
        if (cms.disabled) return valuesOnDisk
        return cms.api.git
          .show(markdownFile.fileRelativePath) // Load the contents of this file at HEAD
          .then((git: { content: string }) => {
            // Parse the content into the MarkdownForm data structure and store it in state.
            const { content: markdownBody, data: frontmatter } = matter(
              git.content
            )
            return { frontmatter, markdownBody }
          })
      },
      onSubmit() {
        return cms.api.git.commit({
          files: [markdownFile.fileRelativePath],
          message: `Commit from Tina: Update ${markdownFile.fileRelativePath}`,
        })
      },
      reset() {
        if (options.reset) {
          options.reset()
        }
        return cms.api.git.reset({ files: [id] })
      },
      onChange(formState) {
        if (options.onChange) {
          options.onChange(formState.values)
        }
        cms.api.git.writeToDisk({
          fileRelativePath: markdownFile.fileRelativePath,
          content: toMarkdownString(formState.values),
        })
      },
    },
    {
      values: valuesOnDisk,
      label,
    }
  )

  return [values || markdownFile, form]
}
