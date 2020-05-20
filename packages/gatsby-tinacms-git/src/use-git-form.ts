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

import {
  useCMS,
  useForm,
  Form,
  useWatchFormValues,
  FormOptions,
  WatchableFormValue,
} from 'tinacms'
import React from 'react'

export interface GitFile {
  fileRelativePath: string
}

export interface GitFormOptions<File extends GitFile>
  extends Partial<FormOptions<File>> {
  format(file: File): string
  parse(content: string): File
}

export function useGitForm<File extends GitFile>(
  file: File,
  options: GitFormOptions<File>,
  watch: WatchableFormValue
): [File, Form] {
  const TINA_DISABLED = process.env.NODE_ENV === 'production'

  const { format, parse, ...formOptions } = options
  const cms = useCMS()

  function loadInitialValues() {
    return cms.api.git
      .show(file.fileRelativePath) // Load the contents of this file at HEAD
      .then((git: any) => {
        const file = parse(git.content)

        return { fileRelativePath: file?.fileRelativePath, ...file }
      })
  }

  const [values, form] = useForm(
    {
      id: file.fileRelativePath,
      label: formOptions.label || '',
      fields: formOptions.fields || [],
      loadInitialValues: TINA_DISABLED ? undefined : loadInitialValues,
      onSubmit(data: any) {
        return cms.api.git.onSubmit!({
          files: [data.fileRelativePath],
          message: data.__commit_message || 'Tina commit',
          name: data.__commit_name,
          email: data.__commit_email,
        })
      },
      reset() {
        return cms.api.git.reset({ files: [file.fileRelativePath] })
      },
      ...formOptions,
    },
    watch
  )

  const writeToDisk = React.useCallback(({ values }) => {
    cms.api.git.onChange!({
      fileRelativePath: values.fileRelativePath,
      content: format(values),
    })
  }, [])

  useWatchFormValues(form, writeToDisk)

  return [values, form]
}
