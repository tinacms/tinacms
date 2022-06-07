/**
 Copyright 2021 Forestry.io Holdings, Inc.
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

import git, {
  CallbackFsClient,
  PromiseFsClient,
  ReadTreeResult,
  TreeEntry,
  WalkerEntry,
} from 'isomorphic-git'
import fs from 'fs-extra'
import type { Bridge } from './index'
import globParent from 'glob-parent'
import normalize from 'normalize-path'

const flat =
  typeof Array.prototype.flat === 'undefined'
    ? (entries) => entries.reduce((acc, x) => acc.concat(x), [])
    : (entries) => entries.flat()

const toUint8Array = (buf: Buffer) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return view
}

// TODO do we need the normalize-path in glob

/**
 * TODO
 */
export class IsomorphicBridge implements Bridge {
  public rootPath: string
  public fsModule: CallbackFsClient | PromiseFsClient
  public isomorphicConfig: {
    fs: CallbackFsClient | PromiseFsClient
    dir: string
  }
  public commitMessage: string
  public authorName: string
  public authorEmail: string

  constructor(
    rootPath: string,
    authorName: string,
    authorEmail: string,
    fsModule?: CallbackFsClient | PromiseFsClient,
    ref?: string,
    commitMessage?: string
  ) {
    this.rootPath = rootPath || ''
    this.fsModule = fsModule || fs
    this.authorName = authorName
    this.authorEmail = authorEmail
    this.isomorphicConfig = {
      dir: normalize(this.rootPath),
      fs: this.fsModule,
    }
    this.commitMessage = commitMessage || 'Update from GraphQL client'
    console.log('IsomorphicBridge initialized', this.rootPath)
  }

  private author() {
    return {
      name: this.authorName,
      email: this.authorEmail,
      timestamp: Math.round(new Date().getTime() / 1000),
      timezoneOffset: 0,
    }
  }

  private async listEntries(
    pattern: string,
    entry: TreeEntry,
    path: string,
    results: string[]
  ) {
    const type = entry.type
    const entryPath = path ? `${path}/${entry.path}` : entry.path
    console.log('listEntries', path, entry.path)
    if (type === 'blob') {
      results.push(entryPath)
      return results
    }

    const treeResult: ReadTreeResult = await git.readTree({
      ...this.isomorphicConfig,
      oid: entry.oid,
    })

    const children: TreeEntry[] = []
    for (const childEntry of treeResult.tree) {
      const childPath = path ? `${path}/${childEntry.path}` : childEntry.path
      if (childEntry.type === 'tree') {
        children.push(childEntry)
      } else {
        if (childPath.startsWith(pattern)) {
          results.push(childPath)
        }
      }
    }

    for (const childEntry of children) {
      const childPath = path ? `${path}/${childEntry.path}` : childEntry.path
      await this.listEntries(pattern, childEntry, childPath, results)
    }
  }

  private async resolvePathEntries(
    path: string,
    ref: string
  ): Promise<{ pathParts: string[]; pathNodes: WalkerEntry[] }> {
    let pathParts = path.split('/')
    const result = await git.walk({
      ...this.isomorphicConfig,
      reduce: async (parent: any, children: any[]) => {
        const flatten = flat(children).filter((child) => {
          if (path.startsWith(child[0]._fullpath)) {
            const entryParts = child[0]._fullpath.split('/')
            for (let i = 0; i < entryParts.length; i++) {
              if (pathParts[i] !== entryParts[i]) {
                return false
              }
            }
            return true
          }
        })
        if (parent !== undefined) flatten.unshift(parent)
        return flatten
      },
      trees: [git.TREE({ ref })],
    })

    const pathNodes = flat(result)
    if (pathParts.indexOf('.') === -1) {
      pathParts = ['.', ...pathParts]
    }

    while (pathParts.length > pathNodes.length) {
      // push placeholders for the non-existent entries
      pathNodes.push(null)
    }
    return { pathParts, pathNodes }
  }

  private async updateTree(
    existingOid: string,
    updatedOid: string,
    path: string,
    type: string,
    pathNodes: WalkerEntry[],
    pathParts: string[]
  ) {
    const lastIdx = pathNodes.length - 1
    const parentEntry = pathNodes[lastIdx]
    const parentPath = pathParts[lastIdx]
    let parentOid
    let tree
    const mode = type === 'blob' ? '100644' : '040000'
    if (parentEntry) {
      parentOid = await parentEntry.oid()
      const treeResult = await git.readTree({
        ...this.isomorphicConfig,
        oid: parentOid,
      })
      tree = existingOid
        ? treeResult.tree.map((entry) => {
            if (entry.path === path) {
              entry.oid = updatedOid
            }
            return entry
          })
        : [
            ...treeResult.tree,
            {
              oid: updatedOid,
              type,
              path,
              mode,
            },
          ]
    } else {
      tree = [
        {
          oid: updatedOid,
          type,
          path,
          mode,
        },
      ]
    }

    const updatedParentOid = await git.writeTree({
      ...this.isomorphicConfig,
      tree,
    })

    if (lastIdx === 0) {
      return updatedParentOid
    } else {
      return await this.updateTree(
        parentOid,
        updatedParentOid,
        parentPath,
        'tree',
        pathNodes.slice(0, lastIdx),
        pathParts.slice(0, lastIdx)
      )
    }
  }

  // TODO need to think about how to keep the checked out files current

  private async currentBranch(): Promise<string> {
    const ref = await git.currentBranch({
      ...this.isomorphicConfig,
      fullname: true,
    })
    if (!ref) {
      throw new Error('Unable to determine current branch from HEAD')
    }
    return ref
  }

  public async glob(pattern: string) {
    const ref = await this.currentBranch()
    const parent = globParent(pattern)
    const { pathParts, pathNodes } = await this.resolvePathEntries(parent, ref)

    const leaf = pathNodes[pathNodes.length - 1]
    if (!leaf) {
      return []
    }

    const entryType = await leaf.type()
    if (entryType === 'blob') {
      return [(leaf as any)._fullpath]
    }

    const entryPath = pathParts[pathParts.length - 1]
    const parentEntry = pathNodes[pathNodes.length - 2]
    let treeEntry: TreeEntry
    let parentPath
    if (parentEntry) {
      const treeResult: ReadTreeResult = await git.readTree({
        ...this.isomorphicConfig,
        oid: await parentEntry.oid(),
      })
      treeEntry = treeResult.tree.find((entry) => entry.path === entryPath)
      parentPath = pathParts.slice(1, pathParts.length).join('/')
    } else {
      // TODO can parentEntry ever be undefined?
      // @ts-ignore
      treeEntry = {
        type: 'tree',
        oid: await leaf.oid(),
      }
      parentPath = ''
    }

    const result = []
    await this.listEntries(pattern, treeEntry, parentPath, result)
    return result
  }

  public supportsBuilding() {
    return true
  }

  public async delete(filepath: string) {
    console.log('delete', filepath)
    const ref = await this.currentBranch()
    const { pathParts, pathNodes } = await this.resolvePathEntries(
      filepath,
      ref
    )
    if (pathNodes.length > 0) {
      let ptr = pathNodes.length - 1
      while (ptr >= 1) {
        // let existingOid
        const leaf = pathNodes[ptr]
        const nodePath = pathParts[ptr]
        if (leaf) {
          if (
            `./${(leaf as any)._fullpath}` !==
            pathParts.slice(0, ptr + 1).join('/')
          ) {
            throw new Error(`'${filepath}' not found`)
          }

          const parentEntry = pathNodes[ptr - 1]
          const existingOid = await parentEntry.oid()
          const treeResult: ReadTreeResult = await git.readTree({
            ...this.isomorphicConfig,
            oid: existingOid,
          })

          const updatedTree = treeResult.tree.filter(
            (value) => value.path !== nodePath
          )

          // The folder is empty after removing the file, so we remove the entire folder
          if (updatedTree.length === 0) {
            ptr -= 1
            continue
          }

          const updatedOid = await git.writeTree({
            ...this.isomorphicConfig,
            tree: updatedTree,
          })

          const updatedRootSha = await this.updateTree(
            existingOid,
            updatedOid,
            pathParts[ptr - 1],
            'tree',
            pathNodes.slice(0, ptr - 1),
            pathParts.slice(0, ptr - 1)
          )

          // TODO consolidate duplicate code for committing tree updates
          const commitSha = await git.writeCommit({
            ...this.isomorphicConfig,
            commit: {
              tree: updatedRootSha,
              parent: [
                await git.resolveRef({
                  ...this.isomorphicConfig,
                  ref,
                }),
              ],
              message: this.commitMessage,
              // TODO these should be configurable
              author: this.author(),
              committer: this.author(),
            },
          })

          await git.writeRef({
            ...this.isomorphicConfig,
            ref,
            value: commitSha,
            force: true, // TODO I don't believe this should be necessary
          })

          break
        }
      }
    } else {
      throw new Error(`Unable to resolve path: ${filepath}`)
    }
  }

  public async get(filepath: string) {
    const ref = await this.currentBranch()
    const oid = await git.resolveRef({
      ...this.isomorphicConfig,
      ref,
    })

    const { blob } = await git.readBlob({
      ...this.isomorphicConfig,
      oid,
      filepath,
    })

    return Buffer.from(blob).toString('utf8')
  }

  public async putConfig(filepath: string, data: string) {
    await this.put(filepath, data)
  }

  public async put(filepath: string, data: string) {
    const ref = await this.currentBranch()
    const { pathParts, pathNodes } = await this.resolvePathEntries(
      filepath,
      ref
    )
    if (pathNodes.length > 0) {
      const blobUpdate = toUint8Array(Buffer.from(data))

      let existingOid
      const leaf = pathNodes[pathNodes.length - 1]
      const nodePath = pathParts[pathParts.length - 1]
      if (leaf) {
        existingOid = await leaf.oid()
        if ((leaf as any)._fullpath !== filepath) {
          // TODO should create the path
          throw new Error(`${filepath} not found`)
        }
        const hash = await git.hashBlob({ object: blobUpdate })
        if (hash.oid === existingOid) {
          return // no changes - exit early
        }
      }

      const updatedOid = await git.writeBlob({
        ...this.isomorphicConfig,
        blob: blobUpdate,
      })

      const updatedRootSha = await this.updateTree(
        existingOid,
        updatedOid,
        nodePath,
        'blob',
        pathNodes.slice(0, pathNodes.length - 1),
        pathParts.slice(0, pathParts.length - 1)
      )
      const commitSha = await git.writeCommit({
        ...this.isomorphicConfig,
        commit: {
          tree: updatedRootSha,
          parent: [await git.resolveRef({ ...this.isomorphicConfig, ref })],
          message: this.commitMessage,
          author: this.author(),
          committer: this.author(),
        },
      })

      await git.writeRef({
        ...this.isomorphicConfig,
        ref,
        value: commitSha,
        force: true, // TODO I don't believe this should be necessary
      })
    } else {
      // TODO at this point we could create the filepath but we'd need to grab the parent
      // Ideally we should be able to grab the entire tree
      throw new Error(`Path not found ${filepath}`)
    }
  }
}
