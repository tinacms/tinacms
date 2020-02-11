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
  pathToRepo: string
  pathToContent: string
  defaultCommitMessage: string
  defaultCommitName: string
  defaultCommitEmail: string
  pushOnCommit: boolean
  sshKey?: string
  gitRemote?: string
}

const DEFAULT_OPTIONS: GitRouterConfig = {
  pathToRepo: process.cwd(),
  pathToContent: '',
  defaultCommitMessage: 'Edited with TinaCMS',
  defaultCommitName: 'TinaCMS',
  defaultCommitEmail: 'git@tinacms.org',
  pushOnCommit: true
}

function setDefaults<T>(defaults: T, partial: Partial<T>): T {
  return Object.assign({}, defaults, partial)
}

export function router(config: Partial<GitRouterConfig> = {}) {
  const {
    pathToRepo,
    pathToContent,
    defaultCommitMessage,
    defaultCommitName,
    defaultCommitEmail,
    pushOnCommit
  } = setDefaults(DEFAULT_OPTIONS, config)
  const CONTENT_ABSOLUTE_PATH = path.join(pathToRepo, pathToContent)
  const TMP_DIR = path.join(CONTENT_ABSOLUTE_PATH, '/tmp/')

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
      pathRoot: pathToRepo,
      name: user.name || req.body.name || defaultCommitName,
      email: user.email || req.body.email || defaultCommitEmail,
      message: `Update from Tina: delete ${fileRelativePath}`,
      push: pushOnCommit,
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
        pathToRepo,
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
      const message = req.body.message || defaultCommitMessage
      const files = req.body.files.map((rel: string) =>
        path.join(CONTENT_ABSOLUTE_PATH, rel)
      )

      // TODO: Separate commit and push???
      await commit({
        pathRoot: pathToRepo,
        name: user.name || req.body.name || defaultCommitName,
        email: user.email || req.body.email || defaultCommitEmail,
        push: pushOnCommit,
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
      await openRepo(pathToRepo).push()
      res.json({ status: 'success' })
    } catch {
      // TODO: More intelligently respond
      res.status(412)
      res.json({ status: 'failure', error: GIT_ERROR_MESSAGE })
    }
  })

  router.post('/reset', (req, res) => {
    const repo = openRepo(pathToRepo)
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
      const summary = await openRepo(pathToRepo).branchLocal()
      res.send({ status: 'success', branch: summary.branches[summary.current] })
    } catch {
      // TODO: More intelligently respond
      res.status(500)
      res.json({ status: 'failure', message: GIT_ERROR_MESSAGE })
    }
  })

  router.get('/branches', async (req, res) => {
    try {
      const summary = await openRepo(pathToRepo).branchLocal()
      res.send({ status: 'success', branches: summary.all })
    } catch {
      // TODO: More intelligently respond
      res.status(500)
      res.json({ status: 'failure', message: GIT_ERROR_MESSAGE })
    }
  })

  router.get('/branches/:name', async (req, res) => {
    try {
      const summary = await openRepo(pathToRepo).branchLocal()
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
        .join(pathToContent, req.params.fileRelativePath)
        .replace(/^\/*/, '')

      const content = await show({
        pathRoot: pathToRepo,
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
