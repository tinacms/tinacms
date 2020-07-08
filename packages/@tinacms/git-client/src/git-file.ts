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
import { CMS } from '@tinacms/core'
import { GitClient } from './git-client'

export class GitFile {
  constructor(
    private cms: CMS,
    public relativePath: string,
    public format: (file: any) => string,
    public parse: (content: string) => any
  ) {}

  /**
   * Load the contents of this file at HEAD
   */
  show = () => {
    return this.git.show(this.relativePath).then((git: { content: string }) => {
      return this.parse(git.content)
    })
  }

  commit = () => {
    return this.cms.api.git.commit!({
      files: [this.relativePath],
    })
  }

  reset = () => {
    this.cms.api.git.reset({ files: [this.relativePath] })
  }

  write = (values: any) => {
    this.cms.api.git.writeToDisk!({
      fileRelativePath: this.relativePath,
      content: this.format(values),
    })
  }

  private get git(): GitClient {
    return this.cms.api.git
  }
}
