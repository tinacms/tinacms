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

import { GitFile, useGitFileSha } from './useGitFileSha'
import { GithubOptions } from './GithubOptions'
import { Options } from 'next-tinacms-markdown'
import { useCMS, useLocalForm } from 'tinacms'
import { FORM_ERROR } from 'final-form'
import { getForkName } from '../github-editing-context/repository'
export const useGithubFileForm = <T = any>(
  file: GitFile<T>,
  formOptions: Options,
  githubOptions: GithubOptions,
  serialize: (data: T) => string
) => {
  const cms = useCMS()
  const [getSha, setSha] = useGitFileSha(file)

  const [formData, form] = useLocalForm({
    id: file.fileRelativePath, // needs to be unique
    label: formOptions.label || file.fileRelativePath,
    initialValues: file.data,
    fields: formOptions.fields || [],
    // save & commit the file when the "save" button is pressed
    onSubmit(formData) {
      return cms.api.github
        .save(
          githubOptions.forkFullName,
          githubOptions.branch,
          file.fileRelativePath,
          getSha(),
          serialize(formData),
          'Update from TinaCMS'
        )
        .then((response: { content: { sha: string } }) => {
          cms.alerts.success(
            `Saved Successfully: Changes committed to ${getForkName()}`
          )
          setSha(response.content.sha)
        })
        .catch((e: any) => {
          return { [FORM_ERROR]: e }
        })
    },
  })

  return [formData || file.data, form]
}
