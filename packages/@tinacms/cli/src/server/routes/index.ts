import { Router } from 'express'
import { join } from 'path'
import { MediaModel } from '../models/media'
const mediaFolder = join(process.cwd(), 'public')
const mediaModel = new MediaModel({ basePath: mediaFolder })

export const mediaRouter = Router()

mediaRouter.get('/list/*', async (req, res) => {
  const folder = req.params[0]
  const media = await mediaModel.listMedia({
    searchPath: folder,
  })
  res.json(media)
})

mediaRouter.post('/delete/*', async (req, res) => {
  const file = req.params[0]
  const didDelete = await mediaModel.deleteMedia({ searchPath: file })
  res.json(didDelete)
})
