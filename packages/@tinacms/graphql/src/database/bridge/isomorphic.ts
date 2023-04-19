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
import { dirname } from 'path'

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
  author: {
    name: string
    email: string
  }
  committer?: {
    name: string
    email: string
  }
  ref?: string
  onPut?: (filepath: string, data: string) => Promise<void>
  onDelete?: (filepath: string) => Promise<void>
}

/**
 * Bridge backed by isomorphic-git
 */
export class IsomorphicBridge implements Bridge {
  public rootPath: string
  public relativePath: string
  public gitRoot: string
  public fsModule: CallbackFsClient | PromiseFsClient
  public isomorphicConfig: {
    fs: CallbackFsClient | PromiseFsClient
    dir: string
  }
  public commitMessage: string
  public author: { name: string; email: string }
  public committer: { name: string; email: string }
  public ref: string | undefined

  private readonly onPut:
    | ((filepath: string, data: string) => Promise<void>)
    | (() => void)
  private readonly onDelete:
    | ((filepath: string) => Promise<void>)
    | (() => void)
  private cache = {}

  constructor(
    rootPath: string,
    {
      gitRoot,
      author,
      committer,
      fsModule = fs,
      commitMessage = 'Update from GraphQL client',
      ref,
      onPut,
      onDelete,
    }: IsomorphicGitBridgeOptions
  ) {
    this.rootPath = rootPath
    this.gitRoot = gitRoot
    this.relativePath = rootPath.slice(this.gitRoot.length).replace(/\\/g, '/')
    if (this.relativePath.startsWith('/')) {
      this.relativePath = this.relativePath.slice(1)
    }
    this.fsModule = fsModule
    this.author = author
    this.committer = committer || author
    this.isomorphicConfig = {
      dir: normalize(this.gitRoot),
      fs: this.fsModule,
    }

    this.ref = ref
    this.commitMessage = commitMessage

    this.onPut = onPut || (() => {})
    this.onDelete = onDelete || (() => {})
  }

  private getAuthor() {
    return {
      ...this.author,
      timestamp: Math.round(new Date().getTime() / 1000),
      timezoneOffset: 0,
    }
  }

  private getCommitter() {
    return {
      ...this.committer,
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
      cache: this.cache,
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
      map: async (filepath, [head]) => {
        if ((head as any)._fullpath === '.') {
          return head
        }
        if (path.startsWith(filepath)) {
          if (dirname(path) === dirname(filepath)) {
            if (path === filepath) {
              // same parent directory so this is the entry
              return head
            }
          } else {
            return head
          }
        }
      },
      cache: this.cache,
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
        cache: this.cache,
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
        author: this.getAuthor(),
        committer: this.getCommitter(),
      },
    })

    await git.writeRef({
      ...this.isomorphicConfig,
      ref,
      value: commitSha,
      force: true,
    })
  }

  private async getRef(): Promise<string> {
    if (this.ref) {
      return this.ref
    }
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
    this.ref = ref
    return ref
  }

  public async glob(pattern: string, extension: string) {
    const ref = await this.getRef()
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
        cache: this.cache,
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
    return results
      .map((path) => this.unqualifyPath(path))
      .filter((path) => path.endsWith(extension))
  }

  public async delete(filepath: string) {
    const ref = await this.getRef()
    const { pathParts, pathEntries } = await this.resolvePathEntries(
      this.qualifyPath(filepath),
      ref
    )

    let oidToRemove: string | undefined
    let ptr = pathEntries.length - 1
    while (ptr >= 1) {
      // let existingOid
      const leafEntry = pathEntries[ptr]
      const nodePath = pathParts[ptr]
      if (leafEntry) {
        oidToRemove = oidToRemove || (await leafEntry.oid())
        const parentEntry = pathEntries[ptr - 1]
        const existingOid = await parentEntry.oid()
        const treeResult: ReadTreeResult = await git.readTree({
          ...this.isomorphicConfig,
          oid: existingOid,
          cache: this.cache,
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

    if (oidToRemove) {
      await git.updateIndex({
        ...this.isomorphicConfig,
        filepath: this.qualifyPath(filepath),
        force: true,
        remove: true,
        oid: oidToRemove,
        cache: this.cache,
      })
    }

    await this.onDelete(filepath)
  }

  private qualifyPath(filepath: string): string {
    return this.relativePath ? `${this.relativePath}/${filepath}` : filepath
  }

  private unqualifyPath(filepath: string): string {
    return this.relativePath
      ? filepath.slice(this.relativePath.length + 1)
      : filepath
  }

  public async get(filepath: string) {
    const ref = await this.getRef()
    const oid = await git.resolveRef({
      ...this.isomorphicConfig,
      ref,
    })

    const { blob } = await git.readBlob({
      ...this.isomorphicConfig,
      oid,
      filepath: this.qualifyPath(filepath),
      cache: this.cache,
    })

    return Buffer.from(blob).toString('utf8')
  }

  public async put(filepath: string, data: string) {
    const ref = await this.getRef()
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
        await this.onPut(filepath, data)
        return // no changes - exit early
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
    await git.updateIndex({
      ...this.isomorphicConfig,
      filepath: this.qualifyPath(filepath),
      add: true,
      oid: updatedOid,
      cache: this.cache,
    })

    await this.onPut(filepath, data)
  }
}
