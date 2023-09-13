import git, { CallbackFsClient, PromiseFsClient } from 'isomorphic-git'
import fs from 'fs-extra'
import path from 'path'
import micromatch from 'micromatch'
import { normalizePath } from '../database/util'

const findGitRoot = async (dir: string): Promise<string> => {
  if (await fs.pathExists(path.join(dir, '.git'))) {
    return dir
  }
  const parentDir = path.dirname(dir)
  if (parentDir === dir) {
    throw new Error('Could not find .git directory')
  }
  return findGitRoot(parentDir)
}

export const getSha = async ({
  fs,
  dir,
}: {
  fs: CallbackFsClient | PromiseFsClient
  dir: string
}) => {
  dir = await findGitRoot(dir)
  return git.resolveRef({
    fs,
    dir,
    ref: 'HEAD',
  })
}

export const getChangedFiles = async ({
  fs,
  dir,
  from,
  to,
  pathFilter,
}: {
  fs: CallbackFsClient | PromiseFsClient
  dir: string
  from: string
  to: string
  pathFilter: Record<string, { matches?: string[] }>
}) => {
  const results = {
    added: [],
    modified: [],
    deleted: [],
  }

  const rootDir = await findGitRoot(dir)
  let pathPrefix = ''
  if (rootDir !== dir) {
    pathPrefix = normalizePath(dir.substring(rootDir.length + 1))
  }
  await git.walk({
    fs,
    dir: rootDir,
    trees: [git.TREE({ ref: from }), git.TREE({ ref: to })],
    map: async function (filename, [A, B]) {
      const relativePath = normalizePath(filename).substring(pathPrefix.length)
      let matches = false
      for (const [key, matcher] of Object.entries(pathFilter)) {
        if (relativePath.startsWith(key)) {
          if (!matcher.matches) {
            matches = true
          } else {
            if (micromatch.isMatch(relativePath, matcher.matches)) {
              matches = true
              break
            }
          }
        }
      }
      if ((await B?.type()) === 'tree') {
        // skip directory matches
        return
      }
      if (matches) {
        let oidA = await A?.oid()
        let oidB = await B?.oid()
        if (oidA !== oidB) {
          if (oidA === undefined) {
            results.added.push(relativePath)
          } else if (oidB === undefined) {
            results.deleted.push(relativePath)
          } else {
            results.modified.push(relativePath)
          }
        }
      }
    },
  })
  return results
}

export const shaExists = async ({
  fs,
  dir,
  sha,
}: {
  fs: CallbackFsClient | PromiseFsClient
  dir: string
  sha: string
}): Promise<boolean> =>
  git
    .readCommit({ fs, dir, oid: sha })
    .then(() => true)
    .catch(() => false)
