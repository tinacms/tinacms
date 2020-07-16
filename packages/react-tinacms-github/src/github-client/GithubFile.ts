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

import { useMemo } from 'react'
import { useCMS } from '@tinacms/react-core'

type parseFn = (content: string) => any
type serializeFn = (data: any) => string

export class GithubFile {
  private sha: string | null = null

  constructor(
    private cms: any,
    private path: string,
    private parse?: parseFn,
    private serialize?: serializeFn
  ) {}

  fetchFile = async () => {
    const res = await this.cms.api.github.fetchFile(this.path)
    this.sha = res.sha
    return this.parse ? this.parse(res.content) : res.content
  }

  commit = async (
    data: any,
    message: string = 'Update from TinaCMS',
    retryOnConflict = true
  ) => {
    const serializedContent = this.serialize ? this.serialize(data) : data
    try {
      if (!this.sha) {
        const res = await this.cms.api.github.fetchFile(this.path)
        this.sha = res.sha
      }
      const response = await this.cms.api.github.commit(
        this.path,
        this.sha,
        serializedContent,
        message
      )
      this.sha = response.content.sha
      this.cms.events.dispatch({ type: 'github:commit', response })
      return response
    } catch (error) {
      if (error.status == 409 && retryOnConflict) {
        await this.fetchFile() // update sha
        await this.commit(data, message, false) // try one more time
      } else {
        this.cms.events.dispatch({ type: 'github:error', error })
        throw error
      }
    }
  }
}

export const useGithubFile = ({
  path,
  parse,
  serialize,
}: {
  path: string
  parse?: parseFn
  serialize?: serializeFn
}) => {
  const cms = useCMS()
  return useMemo(() => {
    return new GithubFile(cms, path, parse, serialize)
  }, [path, parse, serialize, cms])
}
