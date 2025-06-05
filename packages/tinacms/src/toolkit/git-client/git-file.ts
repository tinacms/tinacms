import { CMS } from '@toolkit/core';
import { GitClient } from './git-client';

/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export class GitFile {
  constructor(
    private cms: CMS,
    public relativePath: string,
    public format: (file: any) => string,
    public parse: (content: string) => any
  ) {}

  /**
   * Load the contents of this file at HEAD
   *
   * @deprecated
   */
  show = () => {
    return this.git.show(this.relativePath).then((git: { content: string }) => {
      return this.parse(git.content);
    });
  };

  /**
   * @deprecated
   */
  commit = () => {
    return this.git.commit!({
      files: [this.relativePath],
    }).then((response: Response) =>
      this.cms.events.dispatch({ type: 'git:commit', response })
    );
  };

  /**
   * @deprecated
   */
  reset = () => {
    this.cms.api.git.reset({ files: [this.relativePath] });
  };

  /**
   * @deprecated
   */
  write = (values: any) => {
    this.git.writeToDisk!({
      fileRelativePath: this.relativePath,
      content: this.format(values),
    });
  };

  /**
   * @deprecated
   */
  private get git(): GitClient {
    return this.cms.api.git;
  }
}
