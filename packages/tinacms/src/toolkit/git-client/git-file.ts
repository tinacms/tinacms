import { CMS } from '@toolkit/core'
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
    return this.git.commit!({
      files: [this.relativePath],
    }).then((response: Response) =>
      this.cms.events.dispatch({ type: 'git:commit', response })
    )
  }

  reset = () => {
    this.cms.api.git.reset({ files: [this.relativePath] })
  }

  write = (values: any) => {
    this.git.writeToDisk!({
      fileRelativePath: this.relativePath,
      content: this.format(values),
    })
  }

  private get git(): GitClient {
    return this.cms.api.git
  }
}
