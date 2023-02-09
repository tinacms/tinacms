/**

 */

import { FilesystemBridge } from '@tinacms/datalayer'
import fs from 'fs-extra'
import ini from 'ini'
import os from 'os'
import path from 'path'

const resolveGitRoot = async () => {
  const pathParts = process.cwd().split(path.sep)
  while (true) {
    const pathToGit = pathParts.join(path.sep)
    if (await fs.pathExists(path.join(pathToGit, '.git'))) {
      return pathToGit
    }

    if (!pathParts.length) {
      throw new Error(
        'Unable to locate your .git folder (required for isomorphicGitBridge)'
      )
    }
    pathParts.pop()
  }
}

export async function makeIsomorphicOptions(fsBridge: FilesystemBridge) {
  const gitRoot = await resolveGitRoot()
  const options = {
    gitRoot,
    author: {
      name: '',
      email: '',
    },
    onPut: async (filepath: string, data: string) => {
      await fsBridge.put(filepath, data)
    },
    onDelete: async (filepath: string) => {
      await fsBridge.delete(filepath)
    },
  }

  const userGitConfig = `${os.homedir()}${path.sep}.gitconfig`
  if (await fs.pathExists(userGitConfig)) {
    const config = ini.parse(await fs.readFile(userGitConfig, 'utf-8'))
    if (config['user']?.['name']) {
      options.author.name = config['user']['name']
    }
    if (config['user']?.['email']) {
      options.author.email = config['user']['email']
    }
  }

  let repoGitConfig = undefined
  if (!options.author.name) {
    repoGitConfig = ini.parse(
      await fs.readFile(`${gitRoot}/.git/config`, 'utf-8')
    )
    if (repoGitConfig['user']?.['name']) {
      options.author.name = repoGitConfig['user']['name']
    }

    if (!options.author.name) {
      throw new Error(
        'Unable to determine user.name from git config. Hint: `git config --global user.name "John Doe"`'
      )
    }
  }

  if (!options.author.email) {
    repoGitConfig =
      repoGitConfig ||
      ini.parse(await fs.readFile(`${gitRoot}/.git/config`, 'utf-8'))

    if (repoGitConfig['user']?.['email']) {
      options.author.email = repoGitConfig['user']['email']
    }

    if (!options.author.email) {
      throw new Error(
        'Unable to determine user.email from git config. Hint: `git config --global user.email johndoe@example.com`'
      )
    }
  }
  return options
}
