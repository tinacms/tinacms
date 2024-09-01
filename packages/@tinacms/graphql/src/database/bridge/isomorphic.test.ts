import fs from 'node:fs'
import git from 'isomorphic-git'
import { IsomorphicBridge } from './isomorphic'
import { test, afterEach, expect, describe, beforeEach, vi } from 'vitest'

// Fix issue with test timing out
vi.setConfig({ testTimeout: 20000 })

describe('isomorphic bridge', () => {
  let contentMap: Record<string, string>
  let root
  let repoDir
  let monorepoDir
  let pathToTina
  let branch
  let authorName: string
  let authorEmail: string
  let bridgeMap: Record<string, IsomorphicBridge>

  beforeEach(async () => {
    root = `${process.env.TMPDIR}tinacms-datalayer-${Date.now()}`
    repoDir = `${root}/repo`
    monorepoDir = `${root}/monorepo`
    pathToTina = `my-tina-project`
    branch = 'main'
    authorName = 'Pedro Test'
    authorEmail = 'pedro-test@forestry.io'

    contentMap = {
      'README.md': '# TEST Repository',
      'content/posts/voteForPedro.mdx': '# Vote For Pedro',
      'content/posts/anotherPost.mdx': '# Another Post',
      'content/authors/napoleon.mdx': '# Napoleon',
      'content/authors/pedro.mdx': '# Pedro',
    }
    // repo
    await fs.promises.mkdir(repoDir, { recursive: true })
    await git.init({
      fs,
      dir: repoDir,
      defaultBranch: branch,
    })
    await fs.promises.mkdir(`${repoDir}/content/posts`, { recursive: true })
    await fs.promises.mkdir(`${repoDir}/content/authors`, { recursive: true })
    for (const filepath of Object.keys(contentMap)) {
      await fs.promises.writeFile(
        `${repoDir}/${filepath}`,
        contentMap[filepath]
      )
      await git.add({ fs, dir: repoDir, filepath })
    }
    await git.commit({
      fs,
      dir: repoDir,
      author: {
        name: authorName,
        email: authorEmail,
      },
      message: 'Setup test',
    })

    //monorepo
    await fs.promises.mkdir(monorepoDir, { recursive: true })
    await git.init({
      fs,
      dir: monorepoDir,
      defaultBranch: branch,
    })

    await fs.promises.mkdir(`${monorepoDir}/${pathToTina}/content/posts`, {
      recursive: true,
    })
    await fs.promises.mkdir(`${monorepoDir}/${pathToTina}/content/authors`, {
      recursive: true,
    })
    for (const filepath of Object.keys(contentMap)) {
      await fs.promises.writeFile(
        `${monorepoDir}/${pathToTina}/${filepath}`,
        contentMap[filepath]
      )
      await git.add({
        fs,
        dir: monorepoDir,
        filepath: `${pathToTina}/${filepath}`,
      })
    }
    await git.commit({
      fs,
      dir: monorepoDir,
      author: {
        name: authorName,
        email: authorEmail,
      },
      message: 'Setup test',
    })

    bridgeMap = {
      repo: new IsomorphicBridge(repoDir, {
        gitRoot: repoDir,
        author: {
          name: authorName,
          email: authorEmail,
        },
      }),
      monorepo: new IsomorphicBridge(`${monorepoDir}/${pathToTina}`, {
        gitRoot: monorepoDir,
        author: {
          name: authorName,
          email: authorEmail,
        },
      }),
    }
  })

  afterEach(async () => {
    await fs.promises.rmdir(root, { recursive: true })
  })

  describe.each([['repo'], ['monorepo']])('glob with %p', (repoType) => {
    let bridge: IsomorphicBridge
    beforeEach(() => {
      bridge = bridgeMap[repoType]
    })

    test('empty pattern', async () => {
      const result = await bridge.glob('', '.mdx')
      expect(result).toEqual([
        'content/authors/napoleon.mdx',
        'content/authors/pedro.mdx',
        'content/posts/anotherPost.mdx',
        'content/posts/voteForPedro.mdx',
      ])
    })

    test('file pattern', async () => {
      const result = await bridge.glob('README.md', '.md')
      expect(result).toEqual(['README.md'])
    })

    test('posts folder', async () => {
      const result = await bridge.glob('content/posts', '.mdx')
      expect(result).toEqual([
        'content/posts/anotherPost.mdx',
        'content/posts/voteForPedro.mdx',
      ])
    })

    test('non-existent folder', async () => {
      const result = await bridge.glob('content/foobar', '.md')
      expect(result).toEqual([])
    })
  })

  describe.each([['repo'], ['monorepo']])('get with %p', (repoType) => {
    let bridge: IsomorphicBridge
    beforeEach(() => {
      bridge = bridgeMap[repoType]
    })

    test('get content', async () => {
      const filepath = 'content/posts/anotherPost.mdx'
      const result = await bridge.get(filepath)
      expect(result).toEqual(contentMap[filepath])
    })
  })

  describe.each([['repo'], ['monorepo']])('put with %p', (repoType) => {
    let bridge: IsomorphicBridge
    beforeEach(() => {
      bridge = bridgeMap[repoType]
    })

    test('add', async () => {
      const filepath = 'content/posts/myNewPost.mdx'
      const content = '# My New Post'
      await bridge.put(filepath, content)
      const result = await bridge.glob('content/posts', '.mdx')
      expect(result).toEqual([
        'content/posts/anotherPost.mdx',
        filepath,
        'content/posts/voteForPedro.mdx',
      ])
      expect(content).toEqual(await bridge.get(filepath))
    })

    test('update with existing content', async () => {
      const filepath = 'content/posts/anotherPost.mdx'
      const content = contentMap[filepath]
      await bridge.put(filepath, content)
      const result = await bridge.glob('content/posts', '.mdx')
      expect(result).toEqual([
        'content/posts/anotherPost.mdx',
        'content/posts/voteForPedro.mdx',
      ])
      expect(content).toEqual(await bridge.get(filepath))
    })

    test('update new content', async () => {
      const filepath = 'content/posts/anotherPost.mdx'
      const content = '# My Updated Post'
      await bridge.put(filepath, content)
      const result = await bridge.glob('content/posts', '.mdx')
      expect(result).toEqual([
        'content/posts/anotherPost.mdx',
        'content/posts/voteForPedro.mdx',
      ])
      expect(content).toEqual(await bridge.get(filepath))
    })

    test('update new content and folder', async () => {
      const filepath = 'content/bios/bio1.mdx'
      const content = '# My First Bio'
      await bridge.put(filepath, content)
      const result = await bridge.glob('content/bios', '.mdx')
      expect(result).toEqual([filepath])
      expect(content).toEqual(await bridge.get(filepath))
    })
  })

  describe.each([['repo'], ['monorepo']])('delete with %p', (repoType) => {
    let bridge: IsomorphicBridge
    beforeEach(() => {
      bridge = bridgeMap[repoType]
    })

    test('single post', async () => {
      const filepath = 'content/posts/anotherPost.mdx'
      await bridge.delete(filepath)
      const result = await bridge.glob('content/posts', '.mdx')
      expect(result).toEqual(['content/posts/voteForPedro.mdx'])
    })

    test('non-existent post', async () => {
      const filepath = 'content/posts/foobar.mdx'
      await expect(bridge.delete(filepath)).rejects.toThrow(
        `Unable to resolve path: content/posts/foobar.mdx`
      )
    })

    test('all posts', async () => {
      await bridge.delete('content/posts/anotherPost.mdx')
      await bridge.delete('content/posts/voteForPedro.mdx')
      const result = await bridge.glob('content', '.mdx')
      expect(result).toEqual([
        'content/authors/napoleon.mdx',
        'content/authors/pedro.mdx',
      ])
    })
  })
})
