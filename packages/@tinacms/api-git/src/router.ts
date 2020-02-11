/**

Copyright 2019 Forestry.io Inc

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

import { writeFile, deleteFile } from './file-writer'

import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'

import { commit } from './commit'
import { createUploader } from './upload'
import { openRepo } from './open-repo'
import { show } from './show'
import { checkFilePathIsInRepo } from './utils'

// Don't return full error message to client incase confidential details leak
const GIT_ERROR_MESSAGE =
  'Git Operation failed: Check the logs for more details'

export interface GitRouterConfig {
  pathToRepo?: string
  pathToContent?: string
  defaultCommitMessage?: string
  defaultCommitName?: string
  defaultCommitEmail?: string
  pushOnCommit?: boolean
  sshKey?: string
  gitRemote?: string
}

export function router(config: GitRouterConfig = {}) {
  const REPO_ABSOLUTE_PATH = config.pathToRepo || process.cwd()
  const CONTENT_REL_PATH = config.pathToContent || ''
  const CONTENT_ABSOLUTE_PATH = path.join(REPO_ABSOLUTE_PATH, CONTENT_REL_PATH)
  const TMP_DIR = path.join(CONTENT_ABSOLUTE_PATH, '/tmp/')
  const DEFAULT_COMMIT_MESSAGE =
    config.defaultCommitMessage || 'Edited with TinaCMS'
  const PUSH_ON_COMMIT =
    typeof config.pushOnCommit === 'boolean' ? config.pushOnCommit : true

  const uploader = createUploader(TMP_DIR)

  const router = express.Router()
  router.use(express.json())

  router.delete('/:relPath', (req: any, res: any) => {
    const user = req.user || {}
    const fileRelativePath = decodeURIComponent(req.params.relPath)
    const fileAbsolutePath = path.join(CONTENT_ABSOLUTE_PATH, fileRelativePath)

    try {
      deleteFile(fileAbsolutePath)
    } catch {
      res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
    }

    commit({
      pathRoot: REPO_ABSOLUTE_PATH,
      name: user.name || req.body.name || config.defaultCommitName,
      email: user.email || req.body.email || config.defaultCommitEmail,
      message: `Update from Tina: delete ${fileRelativePath}`,
      push: PUSH_ON_COMMIT,
      files: [fileAbsolutePath],
    })
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(() => {
        res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
      })
  })

  router.put('/:relPath', (req: any, res: any) => {
    const fileRelativePath = decodeURIComponent(req.params.relPath)
    const fileAbsolutePath = path.join(CONTENT_ABSOLUTE_PATH, fileRelativePath)

    if (DEBUG) {
      console.log(fileAbsolutePath)
    }
    try {
      const fileIsInRepo = checkFilePathIsInRepo(
        fileAbsolutePath,
        CONTENT_ABSOLUTE_PATH
      )
      if (fileIsInRepo) {
        writeFile(fileAbsolutePath, req.body.content)
      } else {
        throw new Error(
          `Failed to write to: ${fileRelativePath} \nCannot write outside of the content directory.`
        )
      }
      res.json({ content: req.body.content })
    } catch {
      res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/upload', uploader.single('file'), (req: any, res: any) => {
    try {
      const fileName = req.file.originalname
      const tmpPath = path.join(TMP_DIR, fileName)
      const finalPath = path.join(
        REPO_ABSOLUTE_PATH,
        req.body.directory,
        fileName
      )
      fs.rename(tmpPath, finalPath, (err: any) => {
        if (err) console.error(err)
      })
      res.send(req.file)
    } catch {
      res.status(500).json({ status: 'error', message: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/commit', async (req: any, res: any) => {
    try {
      const user = req.user || {}
      const message = req.body.message || DEFAULT_COMMIT_MESSAGE
      const files = req.body.files.map((rel: string) =>
        path.join(CONTENT_ABSOLUTE_PATH, rel)
      )

      // TODO: Separate commit and push???
      await commit({
        pathRoot: REPO_ABSOLUTE_PATH,
        name: user.name || req.body.name || config.defaultCommitName,
        email: user.email || req.body.email || config.defaultCommitEmail,
        push: PUSH_ON_COMMIT,
        message,
        files,
      })

      res.json({ status: 'success' })
    } catch {
      // TODO: More intelligently respond
      res.status(412)
      res.json({ status: 'failure', error: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/push', async (req: any, res: any) => {
    try {
      await openRepo(REPO_ABSOLUTE_PATH).push()
      res.json({ status: 'success' })
    } catch {
      // TODO: More intelligently respond
      res.status(412)
      res.json({ status: 'failure', error: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/reset', (req, res) => {
    const repo = openRepo(REPO_ABSOLUTE_PATH)
    const files = req.body.files.map((rel: string) =>
      path.join(CONTENT_ABSOLUTE_PATH, rel)
    )
    if (DEBUG) console.log(files)
    repo
      .checkout(files[0])
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(() => {
        res.status(412)
        res.json({ status: 'failure', error: GIT_ERROR_MESSAGE })
      })
  })

  router.get('/branch', async (req, res) => {
    try {
      const summary = await openRepo(REPO_ABSOLUTE_PATH).branchLocal()
      res.send({ status: 'success', branch: summary.branches[summary.current] })
    } catch {
      // TODO: More intelligently respond
      res.status(500)
      res.json({ status: 'failure', message: GIT_ERROR_MESSAGE })
    }
  })

  router.get('/branches', async (req, res) => {
    try {
      const summary = await openRepo(REPO_ABSOLUTE_PATH).branchLocal()
      res.send({ status: 'success', branches: summary.all })
    } catch {
      // TODO: More intelligently respond
      res.status(500)
      res.json({ status: 'failure', message: GIT_ERROR_MESSAGE })
    }
  })

  router.get('/branches/:name', async (req, res) => {
    try {
      const summary = await openRepo(REPO_ABSOLUTE_PATH).branchLocal()
      const branch = summary.branches[req.params.name]

      if (!branch) {
        res.status(404)
        res.json({
          status: 'failure',
          message: `Branch not found: ${String(branch)}`,
        })
        return
      }

      res.send({ status: 'success', branch })
    } catch {
      // TODO: More intelligently respond
      res.status(500)
      res.json({ status: 'failure', message: GIT_ERROR_MESSAGE })
    }
  })

  router.get('/show/:fileRelativePath', async (req, res) => {
    try {
      const fileRelativePath = path.posix
        .join(CONTENT_REL_PATH, req.params.fileRelativePath)
        .replace(/^\/*/, '')

      const content = await show({
        pathRoot: REPO_ABSOLUTE_PATH,
        fileRelativePath,
      })

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
