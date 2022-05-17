import { Router } from 'express'
import { join } from 'path'
import multer from 'multer'
import { MediaModel } from '../models/media'
const mediaFolder = join(process.cwd(), 'public')
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

const mediaModel = new MediaModel({ basePath: mediaFolder })

export const mediaRouter = Router()

mediaRouter.get('/list/*', async (req, res) => {
  const folder = req.params[0]
  const media = await mediaModel.listMedia({
    searchPath: folder,
  })
  res.json(media)
})

mediaRouter.delete('/delete/*', async (req, res) => {
  const file = req.params[0]
  const didDelete = await mediaModel.deleteMedia({ searchPath: file })
  res.json(didDelete)
})

mediaRouter.post('/upload/*', upload.single('file'), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  res.json({ ok: true })
})
