/**

*/

import { Router } from 'express'
import { join } from 'path'
import multer from 'multer'
import { MediaModel, PathConfig } from '../models/media'

export const createMediaRouter = (config: PathConfig): Router => {
  const mediaFolder = join(
    config.rootPath,
    config.publicFolder,
    config.mediaRoot
  )
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, mediaFolder)
    },
    filename: function (req, _file, cb) {
      const file = req.params[0]
      cb(null, file)
    },
  })

  const upload = multer({ storage })
  const uploadRoute = upload.single('file')

  const mediaModel = new MediaModel(config)

  const mediaRouter = Router()

  mediaRouter.get('/list/*', async (req, res) => {
    const folder = req.params[0]
    const cursor = req.query.cursor as string
    const limit = req.query.limit as string
    const media = await mediaModel.listMedia({
      searchPath: folder,
      cursor,
      limit,
    })
    res.json(media)
  })

  mediaRouter.delete('/*', async (req, res) => {
    const file = req.params[0]
    const didDelete = await mediaModel.deleteMedia({ searchPath: file })
    res.json(didDelete)
  })

  mediaRouter.post('/upload/*', async function (req, res) {
    // do it this way for better error handling
    await uploadRoute(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ message: err.message })
        // A Multer error occurred when uploading.
      } else if (err) {
        // An unknown error occurred when uploading.
        res.status(500).json({ message: err.message })
      } else {
        res.json({ success: true })
      }
    })
  })

  return mediaRouter
}
