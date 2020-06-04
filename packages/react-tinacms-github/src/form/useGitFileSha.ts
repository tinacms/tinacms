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

import { useEffect } from 'react'

export interface GitFile<T = any> {
  fileRelativePath: string
  sha: string
  data: T
}

export const useGitFileSha = <T = any>(
  file: GitFile<T>
): [() => string, (sha: string) => void] => {
  const setSha = (sha: string) => {
    return setCachedFormData(file.fileRelativePath, {
      sha,
    })
  }

  useEffect(() => {
    setSha(file.sha)
  }, [file.fileRelativePath])

  return [() => getCachedFormData(file.fileRelativePath).sha, setSha]
}

const getCachedFormData = (id: string) => {
  if (typeof localStorage === 'undefined') {
    return {}
  }
  return JSON.parse(localStorage.getItem(id) || '{}')
}

const setCachedFormData = (id: string, data: { sha: string }) => {
  if (typeof localStorage === 'undefined') {
    return
  }
  localStorage.setItem(id, JSON.stringify(data))
}
