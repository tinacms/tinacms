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

import * as path from 'path'
import * as fs from 'fs'
import * as express from 'express'

import { createUploader } from './upload'
import { Repo } from './repo'

// Don't return full error message to client incase confidential details leak
const GIT_ERROR_MESSAGE =
  'Git Operation failed: Check the logs for more details'

export interface GitRouterConfig {
  defaultCommitMessage: string
  defaultCommitName: string
  defaultCommitEmail: string
  pushOnCommit: boolean
}

const DEFAULT_OPTIONS: GitRouterConfig = {
  defaultCommitMessage: 'Edited with TinaCMS',
  defaultCommitName: 'TinaCMS',
  defaultCommitEmail: 'git@tinacms.org',
  pushOnCommit: true,
}

export function router(repo: Repo, config: Partial<GitRouterConfig> = {}) {
  const {
    defaultCommitMessage,
    defaultCommitName,
    defaultCommitEmail,
    pushOnCommit,
  }: GitRouterConfig = { ...DEFAULT_OPTIONS, ...config }

  if (!repo) {
    /**
     * Incase js users forget to pass in `repo`.
     */
    throw new Error(
      '@einsteinindustries/tinacms-api-git#router(repo, config): Parameter `repo` is missing.'
    )
  } else if (!(repo instanceof Repo)) {
    /**
     * Maintains backwards compatibility. Types are intentionally
     * left out to discourage people from using it.
     */
    const repoConfig: any = repo
    repo = new Repo(repoConfig.pathToRepo, repoConfig.pathToContent)
  }

  const uploader = createUploader(repo.tmpDir)

  const router = express.Router()
  router.use(express.json())

  router.get('/', getGitFile)
  router.get('/:relPath', getGitFile)

  async function getGitFile(req: any, res: any) {
    try {
      const path = decodeURIComponent(req.params.relPath || '/')

      const file = await repo.getFile(path)
      /**
       * if file return file contents
       * if directory
       */
      res.json({ status: 'success', file })
    } catch (e) {
      console.error(e)
      res.status(500).json({ status: 'error' })
    }
  }

  router.delete('/:relPath', async (req: any, res: any) => {
    try {
      const user = req.user || {}
      const fileRelativePath = decodeURIComponent(req.params.relPath)

      await repo.deleteFiles(fileRelativePath, {
        name: user.name || req.body.name || defaultCommitName,
        email: user.email || req.body.email || defaultCommitEmail,
        message: `Update from Tina: delete ${fileRelativePath}`,
        files: [fileRelativePath],
      })

      if (pushOnCommit) {
        await repo.push()
      }

      res.json({ status: 'success' })
    } catch {
      res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
    }
  })

  router.put('/:relPath', (req: any, res: any) => {
    try {
      const fileRelativePath = decodeURIComponent(req.params.relPath)
      repo.writeFile(fileRelativePath, req.body.content)
      res.json({ content: req.body.content })
    } catch {
      res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
    }
  })

  router.post(
    '/upload',
    uploader.single('file'),
    async (req: any, res: any) => {
      try {
        const user = req.user || {}
        const message = req.body.message || defaultCommitMessage

        const fileName = req.file.originalname
        const tmpPath = path.join(repo.tmpDir, fileName)
        const relPath = path.join(req.body.directory, fileName)
        const absPath = repo.fileAbsolutePath(relPath)

        if (repo.fileIsInRepo(absPath)) {
          fs.renameSync(tmpPath, absPath)

          await repo.commit({
            name: user.name || req.body.name || defaultCommitName,
            email: user.email || req.body.email || defaultCommitEmail,
            message,
            files: [relPath],
          })

          if (pushOnCommit) {
            await repo.push()
          }

          res.send(req.file)
        }
      } catch {
        res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
      }
    }
  )

  router.post('/commit', async (req: any, res: any) => {
    try {
      const user = req.user || {}
      const message = req.body.message || defaultCommitMessage

      await repo.commit({
        name: user.name || req.body.name || defaultCommitName,
        email: user.email || req.body.email || defaultCommitEmail,
        message,
        files: req.body.files,
      })

      if (pushOnCommit) {
        await repo.push()
      }

      res.json({ status: 'success' })
    } catch {
      // TODO: More intelligently respond
      res.status(412).json({ status: 'failure', error: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/push', async (req: any, res: any) => {
    try {
      await repo.push()
      res.json({ status: 'success' })
    } catch {
      // TODO: More intelligently respond
      res.status(412).json({ status: 'failure', error: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/reset', async (req: any, res: any) => {
    try {
      // TODO: I feel like this in wrong. Taking a list of files and then only resetting the first one?
      await repo.reset(req.body.files[0])
      res.json({ status: 'success' })
    } catch {
      res.status(412).json({ status: 'failure', error: GIT_ERROR_MESSAGE })
    }
  })

  router.get('/show/:fileRelativePath', async (req: any, res: any) => {
    try {
      const content = await repo.getFileAtHead(req.params.fileRelativePath)

      res.json({
        fileRelativePath: req.params.fileRelativePath,
        content,
        status: 'success',
      })
    } catch {
      res.status(501)
      res.json({
        status: 'failure',
        message: GIT_ERROR_MESSAGE,
        fileRelativePath: req.params.fileRelativePath,
      })
    }
  })

  return router
}
