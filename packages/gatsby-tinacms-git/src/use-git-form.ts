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

import { useCMS, useForm, Form, useWatchFormValues } from 'tinacms'
import React from 'react'

export function useGitForm(node: any, options: any, watch: any): [any, Form] {
  // NODE_ENV will never change at runtime
  const TINA_DISABLED = process.env.NODE_ENV === 'production'

  const { format, parse, ...formOptions } = options
  const cms = useCMS()

  function loadInitialValues() {
    return cms.api.git
      .show(node.fileRelativePath) // Load the contents of this file at HEAD
      .then((git: any) => {
        const file = parse(git.content)

        return { fileRelativePath: node?.fileRelativePath, ...file }
      })
  }

  const [values, form] = useForm(
    {
      ...formOptions,
      id: node.fileRelativePath,
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
        return cms.api.git.reset({ files: [node.fileRelativePath] })
      },
    },
    watch
  )

  const writeToDisk = React.useCallback(formState => {
    cms.api.git.onChange!({
      fileRelativePath: formState.values.fileRelativePath,
      content: format(formState.values),
    })
  }, [])

  useWatchFormValues(form, writeToDisk)

  return [values, form]
}
