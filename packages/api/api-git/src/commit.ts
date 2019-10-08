import { openRepo } from './open-repo'

export interface CommitOptions {
  pathRoot: string
  files: string[]
  message: string
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
  await repo.commit(message, ...files, options)
  await repo.push()
}
