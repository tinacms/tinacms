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

import { GitFile } from './useGitFileSha'
import { useCMS, useForm, FormOptions } from 'tinacms'
import { FORM_ERROR } from 'final-form'
import { GithubClient, useGithubFile } from '../github-client'

export interface GithubFormOptions extends Partial<FormOptions<any>> {
  serialize: (data: any) => string
}

export const useGithubFileForm = <T = any>(
  file: GitFile<T>,
  options: GithubFormOptions
) => {
  const cms = useCMS()
  const githubFile = useGithubFile({
    path: file.fileRelativePath,
    serialize: options.serialize,
  })

  const [formData, form] = useForm({
    id: file.fileRelativePath,
    label: options.label || file.fileRelativePath,
    initialValues: file.data,
    fields: options.fields || [],
    actions: options.actions || [],
    onSubmit(formData) {
      const github: GithubClient = cms.api.github
      return githubFile
        .commit(formData)
        .then(() => {
          cms.alerts.success(
            `Saved Successfully: Changes committed to ${github.workingRepoFullName}`
          )
        })
        .catch((error: any) => {
          return { [FORM_ERROR]: error }
        })
    },
  })

  return [formData || file.data, form]
}
