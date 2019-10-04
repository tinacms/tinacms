import * as git from 'simple-git/promise'

const GIT_SSH_COMMAND =
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

const DEFAULT_MESSAGE = 'Update from Tina'

export interface CommitOptions {
  pathRoot: string
  files: string[]
  message?: string
  name?: string
  email?: string
}

/**
 * Commit a set of files in a Git repo
 */
export async function commit({
  files,
  message,
  name,
  email,
  pathRoot,
}: CommitOptions) {
  let options

  if (email) {
    options = {
      '--author': `"${name || email} <${email}>"`,
    }
  }

  const repo = openRepo(pathRoot)
  await repo.commit(message || DEFAULT_MESSAGE, ...files, options)
  await repo.push()
}

/**
 * Opens and prepares a SimpleGit repository.
 *
 * @param absolutePath string
 */
function openRepo(absolutePath: string) {
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
