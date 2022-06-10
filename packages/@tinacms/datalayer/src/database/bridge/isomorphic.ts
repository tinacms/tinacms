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
import { GraphQLError } from 'graphql'

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

export type IsomorphicGitBridgeOptions = {
  gitRoot: string
  fsModule?: CallbackFsClient | PromiseFsClient
  commitMessage?: string
  authorName: string
  authorEmail: string
  committerName?: string
  committerEmail?: string
  onPut?: (filepath: string, data: string) => Promise<void>
  onDelete?: (filepath: string) => Promise<void>
}

/**
 * Bridge backed by isomorphic-git
 */
export class IsomorphicBridge implements Bridge {
  public rootPath: string
  public gitRoot: string
  public fsModule: CallbackFsClient | PromiseFsClient
  public isomorphicConfig: {
    fs: CallbackFsClient | PromiseFsClient
    dir: string
  }
  public commitMessage: string
  public authorName: string
  public authorEmail: string
  public committerName: string
  public committerEmail: string

  private onPut:
    | ((filepath: string, data: string) => Promise<void>)
    | (() => void)
  private onDelete: ((filepath: string) => Promise<void>) | (() => void)

  constructor(
    rootPath: string,
    {
      gitRoot,
      authorName,
      authorEmail,
      committerName,
      committerEmail,
      fsModule = fs,
      commitMessage = 'Update from GraphQL client',
      onPut,
      onDelete,
    }: IsomorphicGitBridgeOptions
  ) {
    this.gitRoot = gitRoot
    this.rootPath = rootPath
    this.fsModule = fsModule
    this.authorName = authorName
    this.authorEmail = authorEmail
    this.committerName = committerName || authorName
    this.committerEmail = committerEmail || authorEmail
    this.isomorphicConfig = {
      dir: normalize(this.gitRoot),
      fs: this.fsModule,
    }

    this.commitMessage = commitMessage

    this.onPut = onPut || (() => {})
    this.onDelete = onDelete || (() => {})
  }

  private author() {
    return {
      name: this.authorName,
      email: this.authorEmail,
      timestamp: Math.round(new Date().getTime() / 1000),
      timezoneOffset: 0,
    }
  }

  private committer() {
    return {
      name: this.committerName,
      email: this.committerEmail,
      timestamp: Math.round(new Date().getTime() / 1000),
      timezoneOffset: 0,
    }
  }

  /**
   * Recursively populate paths matching `pattern` for the given `entry`
   *
   * @param pattern - pattern to filter paths by
   * @param entry - TreeEntry to start building list from
   * @param path - base path
   * @param results
   * @private
   */
  private async listEntries({
    pattern,
    entry,
    path,
    results,
  }: {
    pattern: string
    entry: TreeEntry
    path?: string
    results: string[]
  }) {
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
      await this.listEntries({
        pattern,
        entry: childEntry,
        path: childPath,
        results,
      })
    }
  }

  /**
   * For the specified path, returns an object with an array containing the parts of the path (pathParts)
   * and an array containing the WalkerEntry objects for the path parts (pathEntries). Any null elements in the
   * pathEntries are placeholders for non-existent entries.
   *
   * @param path - path being resolved
   * @param ref - ref to resolve path entries for
   * @private
   */
  private async resolvePathEntries(
    path: string,
    ref: string
  ): Promise<{ pathParts: string[]; pathEntries: WalkerEntry[] }> {
    let pathParts = path.split('/')
    const result = await git.walk({
      ...this.isomorphicConfig,
      reduce: async (parent: any, children: any[]) => {
        const flatten = flat(children).filter(([child]) =>
          path.startsWith(child._fullpath)
        )
        if (parent !== undefined) flatten.unshift(parent)
        return flatten
      },
      trees: [git.TREE({ ref })],
    })

    const pathEntries = flat(result)
    if (pathParts.indexOf('.') === -1) {
      pathParts = ['.', ...pathParts]
    }

    while (pathParts.length > pathEntries.length) {
      // push placeholders for the non-existent entries
      pathEntries.push(null)
    }
    return { pathParts, pathEntries }
  }

  /**
   * Updates tree entry and associated parent tree entries
   *
   * @param existingOid - the existing OID
   * @param updatedOid - the updated OID
   * @param path - the path of the entry being updated
   * @param type - the type of the entry being updated (blob or tree)
   * @param pathEntries - parent path entries
   * @param pathParts - parent path parts
   * @private
   */
  private async updateTreeHierarchy(
    existingOid: string,
    updatedOid: string,
    path: string,
    type: string,
    pathEntries: WalkerEntry[],
    pathParts: string[]
  ) {
    const lastIdx = pathEntries.length - 1
    const parentEntry = pathEntries[lastIdx]
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
      return await this.updateTreeHierarchy(
        parentOid,
        updatedParentOid,
        parentPath,
        'tree',
        pathEntries.slice(0, lastIdx),
        pathParts.slice(0, lastIdx)
      )
    }
  }

  /**
   * Creates a commit for the specified tree and updates the specified ref to point to the commit
   *
   * @param treeSha - sha of the new tree
   * @param ref - the ref that should be updated
   * @private
   */
  private async commitTree(treeSha: string, ref: string) {
    const commitSha = await git.writeCommit({
      ...this.isomorphicConfig,
      commit: {
        tree: treeSha,
        parent: [
          await git.resolveRef({
            ...this.isomorphicConfig,
            ref,
          }),
        ],
        message: this.commitMessage,
        // TODO these should be configurable
        author: this.author(),
        committer: this.committer(),
      },
    })

    await git.writeRef({
      ...this.isomorphicConfig,
      ref,
      value: commitSha,
      force: true,
    })
  }

  private async currentBranch(): Promise<string> {
    const ref = await git.currentBranch({
      ...this.isomorphicConfig,
      fullname: true,
    })
    if (!ref) {
      throw new GraphQLError(
        `Unable to determine current branch from HEAD`,
        null,
        null,
        null,
        null,
        null,
        {}
      )
    }
    return ref
  }

  public async glob(pattern: string) {
    const ref = await this.currentBranch()
    const parent = globParent(this.qualifyPath(pattern))
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      parent,
      ref
    )

    const leafEntry = pathEntries[pathEntries.length - 1]
    const entryPath = pathParts[pathParts.length - 1]
    const parentEntry = pathEntries[pathEntries.length - 2]
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
      // @ts-ignore
      treeEntry = {
        type: 'tree',
        oid: await leafEntry.oid(),
      }
      parentPath = ''
    }

    const results = []
    await this.listEntries({
      pattern: this.qualifyPath(pattern),
      entry: treeEntry,
      path: parentPath,
      results,
    })
    return results.map((path) => this.unqualifyPath(path))
  }

  public supportsBuilding() {
    return true
  }

  public async delete(filepath: string) {
    const ref = await this.currentBranch()
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      this.qualifyPath(filepath),
      ref
    )

    let ptr = pathEntries.length - 1
    while (ptr >= 1) {
      // let existingOid
      const leafEntry = pathEntries[ptr]
      const nodePath = pathParts[ptr]
      if (leafEntry) {
        const parentEntry = pathEntries[ptr - 1]
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

        const updatedTreeOid = await git.writeTree({
          ...this.isomorphicConfig,
          tree: updatedTree,
        })

        const updatedRootTreeOid = await this.updateTreeHierarchy(
          existingOid,
          updatedTreeOid,
          pathParts[ptr - 1],
          'tree',
          pathEntries.slice(0, ptr - 1),
          pathParts.slice(0, ptr - 1)
        )

        await this.commitTree(updatedRootTreeOid, ref)

        break
      } else {
        throw new GraphQLError(
          `Unable to resolve path: ${filepath}`,
          null,
          null,
          null,
          null,
          null,
          { status: 404 }
        )
      }
    }

    await this.onDelete(filepath)
  }

  private qualifyPath(filepath: string): string {
    return this.rootPath ? `${this.rootPath}/${filepath}` : filepath
  }

  private unqualifyPath(filepath: string): string {
    return this.rootPath ? filepath.slice(this.rootPath.length + 1) : filepath
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
      filepath: this.qualifyPath(filepath),
    })

    return Buffer.from(blob).toString('utf8')
  }

  public async putConfig(filepath: string, data: string) {
    await this.put(filepath, data)
  }

  public async put(filepath: string, data: string) {
    console.log('put', filepath)
    const ref = await this.currentBranch()
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      this.qualifyPath(filepath),
      ref
    )

    const blobUpdate = toUint8Array(Buffer.from(data))

    let existingOid
    const leafEntry = pathEntries[pathEntries.length - 1]
    const nodePath = pathParts[pathParts.length - 1]
    if (leafEntry) {
      existingOid = await leafEntry.oid()
      const hash = await git.hashBlob({ object: blobUpdate })
      if (hash.oid === existingOid) {
        console.log('oid matches - no update')
        return // no changes - exit early
      } else {
        console.log('oid mismatch - will update')
      }
    }

    const updatedOid = await git.writeBlob({
      ...this.isomorphicConfig,
      blob: blobUpdate,
    })

    const updatedRootSha = await this.updateTreeHierarchy(
      existingOid,
      updatedOid,
      nodePath,
      'blob',
      pathEntries.slice(0, pathEntries.length - 1),
      pathParts.slice(0, pathParts.length - 1)
    )

    await this.commitTree(updatedRootSha, ref)

    await this.onPut(filepath, data)
  }
}
