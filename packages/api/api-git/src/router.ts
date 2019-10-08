import { writeFile, deleteFile } from './file-writer'

import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'

import { commit } from './commit'
import { createUploader } from './upload'
import { openRepo } from './open-repo'

export interface GitRouterConfig {
  defaultCommitMessage?: string
}
export function router(config: GitRouterConfig = {}) {
  const REPO_ABSOLUTE_PATH = process.cwd()
  const TMP_DIR = path.join(REPO_ABSOLUTE_PATH, '/tmp/')
  const DEFAULT_COMMIT_MESSAGE =
    config.defaultCommitMessage || 'Update from Tina'

  const uploader = createUploader(TMP_DIR)

  const router = express.Router()
  router.use(express.json())

  router.delete('/:relPath', (req: any, res: any) => {
    const fileRelativePath = decodeURIComponent(req.params.relPath)
    const fileAbsolutePath = path.join(REPO_ABSOLUTE_PATH, fileRelativePath)

    try {
      deleteFile(fileAbsolutePath)
    } catch (e) {
      res.status(500).json({ status: 'error', message: e.message })
    }

    commit({
      pathRoot: REPO_ABSOLUTE_PATH,
      name: req.body.name,
      email: req.body.email,
      message: `Update from Tina: delete ${fileRelativePath}`,
      files: [fileAbsolutePath],
    })
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(e => {
        res.status(500).json({ status: 'error', message: e.message })
      })
  })

  router.put('/:relPath', (req: any, res: any) => {
    const fileRelativePath = decodeURIComponent(req.params.relPath)
    const fileAbsolutePath = path.join(REPO_ABSOLUTE_PATH, fileRelativePath)

    if (DEBUG) {
      console.log(fileAbsolutePath)
    }
    try {
      writeFile(fileAbsolutePath, req.body.content)
      res.json({ content: req.body.content })
    } catch (e) {
      res.status(500).json({ status: 'error', message: e.message })
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
    } catch (e) {
      res.status(500).json({ status: 'error', message: e.message })
    }
  })

  router.post('/commit', (req: any, res: any) => {
    const message = req.body.message || DEFAULT_COMMIT_MESSAGE
    const files = req.body.files.map((rel: string) =>
      path.join(REPO_ABSOLUTE_PATH, rel)
    )
    // TODO: Separate commit and push???
    commit({
      pathRoot: REPO_ABSOLUTE_PATH,
      name: req.body.name,
      email: req.body.email,
      message,
      files,
    })
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(e => {
        // TODO: More intelligently respond
        res.status(412)
        res.json({ status: 'failure', error: e.message })
      })
  })

  router.post('/reset', (req, res) => {
    let repo = openRepo(REPO_ABSOLUTE_PATH)
    const files = req.body.files.map((rel: string) =>
      path.join(REPO_ABSOLUTE_PATH, rel)
    )
    if (DEBUG) console.log(files)
    repo
      .checkout(files[0])
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch((e: any) => {
        res.status(412)
        res.json({ status: 'failure', error: e.message })
      })
  })

  return router
}
