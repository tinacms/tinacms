import { writeFile, deleteFile } from './file-writer'

const fs = require('fs')
const path = require('path')
const express = require('express')
const git = require('simple-git/promise')
let multer = require('multer')

const GIT_SSH_COMMAND =
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

const DEFAULT_MESSAGE = 'Update from Tina'

//If an upload path doesnt exist, create it
function verifyUploadPath(uploadPath: string, callback: () => void) {
  fs.exists(uploadPath, function(exists: boolean) {
    if (exists) {
      callback()
    } else {
      fs.mkdir(uploadPath, function() {
        callback()
      })
    }
  })
}

export function router() {
  let pathRoot = process.cwd()
  const tmpImgDir = path.join(pathRoot, '/tmp/')

  let tmpImgStorage = multer.diskStorage({
    destination: function(req: any, file: any, cb: any) {
      verifyUploadPath(tmpImgDir, () => {
        cb(null, tmpImgDir)
      })
    },
    filename: function(req: any, file: any, cb: any) {
      cb(null, file.originalname)
    },
  })
  const upload = multer({ storage: tmpImgStorage })

  let router = express.Router()
  router.use(express.json())

  router.delete('/:relPath', (req: any, res: any) => {
    let rel = decodeURIComponent(req.params.relPath)
    let abs = path.join(pathRoot, rel)
    try {
      deleteFile(abs)
    } catch (e) {
      res.status(500).json({ status: 'error', message: e.message })
    }

    commit({
      name: req.body.name,
      email: req.body.email,
      message: `Update from Tina: delete ${rel}`,
      files: [abs],
    })
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(e => {
        res.status(500).json({ status: 'error', message: e.message })
      })
  })

  router.put('/:relPath', (req: any, res: any) => {
    if (DEBUG) {
      console.log(path.join(pathRoot, decodeURIComponent(req.params.relPath)))
    }
    try {
      writeFile(
        path.join(pathRoot, decodeURIComponent(req.params.relPath)),
        req.body.content
      )
      res.json({ content: req.body.content })
    } catch (e) {
      res.status(500).json({ status: 'error', message: e.message })
    }
  })

  router.post('/upload', upload.single('file'), (req: any, res: any) => {
    try {
      const fileName = req.file.originalname
      let tmpPath = path.join(tmpImgDir, fileName)
      let finalPath = path.join(pathRoot, req.body.directory, fileName)
      fs.rename(tmpPath, finalPath, (err: any) => {
        if (err) console.error(err)
      })
      res.send(req.file)
    } catch (e) {
      res.status(500).json({ status: 'error', message: e.message })
    }
  })

  router.post('/commit', (req: any, res: any) => {
    let message = req.body.message
    let files = req.body.files.map((rel: string) => path.join(pathRoot, rel))
    // TODO: Separate commit and push???
    commit({
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

  interface CommitOptions {
    files: string[]
    message?: string
    name?: string
    email?: string
  }

  function openRepo() {
    const repo = git(pathRoot)

    /**
     * This is here to allow committing from the cloud
     *
     * `repo.env` overwrites the environment. Adding `...process.env`
     *  is required for accessing global config values. (i.e. user.name, user.email)
     */
    repo.env({ ...process.env, GIT_SSH_COMMAND: GIT_SSH_COMMAND })

    return repo
  }

  async function commit({ files, message, name, email }: CommitOptions) {
    let options

    if (email) {
      options = {
        '--author': `"${name || email} <${email}>"`,
      }
    }

    const repo = openRepo()
    await repo.commit(message || DEFAULT_MESSAGE, ...files, options)
    await repo.push()
  }

  return router
}
