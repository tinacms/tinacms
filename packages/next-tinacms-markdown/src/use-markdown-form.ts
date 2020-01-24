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

import { useCallback, useEffect, useState } from 'react'
const matter = require('gray-matter')
import * as yaml from 'js-yaml'

import {
  useWatchFormValues,
  useForm,
  useCMS,
  FormOptions,
  Field,
} from 'tinacms'

/**
 * A datastructure representing a MarkdownFile stored in Git
 */

export interface MarkdownFile  {
  fileRelativePath: string
  frontmatter: any
  markdownBody: string
}

export interface Options {
  id?: string
  label?: string
  fields?: Field[]
  actions?: FormOptions<any>['actions']
}

export function toMarkdownString(markdownFile: MarkdownFile) {
  return (
    '---\n' +
    yaml.dump(markdownFile.frontmatter) +
    '---\n' +
    (markdownFile.markdownBody || '')
  )
}
/**
 * Creates a TinaCMS Form for editing a MarkdownFile in Git
 */
export function useMarkdownForm (
  markdownFile: MarkdownFile,
  options: Options = {}
) {
  const cms = useCMS()

  const [valuesInGit, setValuesInGit] = useState()
  const valuesOnDisk = markdownFile

  useEffect(() => {
    cms.api.git
      .show(markdownFile.fileRelativePath) // Load the contents of this file at HEAD
        .then((git: {content: string}) => {
          // Parse the content into the MarkdownForm data structure and store it in state.
          const { content: markdownBody, data: frontmatter } = matter(
            git.content
          )
          setValuesInGit({ frontmatter, markdownBody })
      })
      .catch((e: any) => {
        console.log('FAILED', e)
      })
  }, [markdownFile.fileRelativePath])

  const id = options.id || markdownFile.fileRelativePath
  const label = options.label || markdownFile.fileRelativePath
  const fields = options.fields || []
  const actions = options.actions || []
  const [values, form] = useForm(
    {
      id,
      label,
      fields,
      actions,
      initialValues: valuesInGit,
      onSubmit() {
        return cms.api.git.commit({
          files: [markdownFile.fileRelativePath],
          message: `Commit from Tina: Update ${markdownFile.fileRelativePath}`,
        })
      },
      reset() {
        return cms.api.git.reset({ files: [id] })
      },
    },
    { 
      values: valuesOnDisk,
      label
    }
  )

  const writeToDisk = useCallback(formState => {
    cms.api.git.writeToDisk({
      fileRelativePath: markdownFile.fileRelativePath,
      content: toMarkdownString(formState.values),
    })
  }, [])

  useWatchFormValues(form, writeToDisk)

  return [values || markdownFile, form]
}
