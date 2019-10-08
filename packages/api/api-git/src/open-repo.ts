const git = require('simple-git/promise')

const GIT_SSH_COMMAND =
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

/**
 * Opens and prepares a SimpleGit repository.
 *
 * @param absolutePath string
 */
export function openRepo(absolutePath: string) {
  const repo = git(absolutePath)

  /**
   * This is here to allow committing from the cloud
   *
   * `repo.env` overwrites the environment. Adding `...process.env`
   *  is required for accessing global config values. (i.e. user.name, user.email)
   */
  repo.env({ ...process.env, GIT_SSH_COMMAND: GIT_SSH_COMMAND })

  return repo
}
