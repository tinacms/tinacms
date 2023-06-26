import git, { CallbackFsClient, PromiseFsClient } from 'isomorphic-git'
import fs from 'fs-extra'
import path from 'path'

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
  pathFilter: Record<string, boolean>
}) => {
  console.log({ pathFilter })
  const results = {
    added: [],
    modified: [],
    deleted: [],
  }
  dir = await findGitRoot(dir)
  // const gitdir = path.join(await findGitRoot(dir), '.git')
  // console.log({gitdir, dir})
  // console.log(path)
  // TODO should we employ match patterns here?
  await git.walk({
    fs,
    dir,
    // gitdir,
    trees: [git.TREE({ ref: from }), git.TREE({ ref: to })],
    map: async function (filename, [A, B]) {
      let found = false
      for (const [key, value] of Object.entries(pathFilter)) {
        if (filename.startsWith(key)) {
          found = true
          break
        }
      }
      if (!found) {
        console.log('not found', filename)
        return
      }
      console.log({ filename })
      // if ((await A.type()) === 'tree') {
      //   return
      // }
      let oidA = await A.oid()
      let oidB = await B.oid()
      console.log({ oidA, oidB })
      if (oidA !== oidB) {
        if (oidA === undefined) {
          results.added.push(filename)
        } else if (oidB === undefined) {
          results.deleted.push(filename)
        } else {
          results.modified.push(filename)
        }
      }
    },
  })
  console.log({ results })
  // Locally modified files
  // await git.walk({
  //   fs,
  //   dir,
  //   gitdir,
  //   trees: [git.TREE({ref: to}), git.WORKDIR()],
  //   map: async function (filename, [A, B]) {
  //     // console.log(A,B)
  //     if (!A || !B) {
  //       // console.log('no A or B', filename)
  //       return
  //     }
  //     if (await A.type() === 'tree') {
  //       return
  //     }
  //     let oidA = await A.oid()
  //     let oidB = await B.oid()
  //     if (oidA !== oidB) {
  //       if (oidA === undefined) {
  //         results.added.push(filename)
  //       } else if (oidB === undefined) {
  //         results.deleted.push(filename)
  //       } else {
  //         results.modified.push(filename)
  //       }
  //     }
  //   }
  // })
  // console.log({entries})
  // for (const entry of entries) {
  //   if (entry.type === 'blob') {
  //     if (entry.mode === '100644') {
  //       results.added.push(entry.path)
  //     } else if (entry.mode === '100755') {
  //       results.modified.push(entry.path)
  //     }
  //   } else if (entry.type === 'tree') {
  //     results.added.push(entry.path)
  //   }
  // }
  return results
}
