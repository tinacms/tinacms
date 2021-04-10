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

import { useForm, Form, FormOptions, WatchableFormValue, useCMS } from 'tinacms'
import { useGitFile } from '@tinacms/git-client'

export interface GitNode {
  fileRelativePath: string
}

export interface GitFormOptions<File extends GitNode>
  extends Partial<FormOptions<File>> {
  format(file: File): string
  parse(content: string): File
}

export function useGitForm<N extends GitNode>(
  node: N,
  options: GitFormOptions<N>,
  watch: WatchableFormValue
): [N, Form, boolean] {
  const cms = useCMS()
  const { format, parse, ...config } = options
  const gitFile = useGitFile(node.fileRelativePath, format, parse)

  const defaultConfig = {
    label: '',
    fields: [],
    async loadInitialValues() {
      if (cms.disabled) return watch.values
      return gitFile.show()
    },
    onSubmit: gitFile.commit,
    reset: gitFile.reset,
    onChange({ values }: any) {
      return gitFile.write(values)
    },
  }

  return useForm(
    {
      ...defaultConfig,
      ...config,
      id: gitFile.relativePath,
    },
    watch
  )
}
