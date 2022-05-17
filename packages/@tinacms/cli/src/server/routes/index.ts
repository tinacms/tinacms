import { Router } from 'express'
import { join } from 'path'
import { listMedia } from '../models/media'
const mediaFolder = join(process.cwd(), 'public')
export const mediaRouter = Router()

mediaRouter.get('/list/*', async (req, res) => {
  const folder = req.params[0]
  const media = await listMedia({ basePath: mediaFolder, searchPath: folder })
  res.json(media)
})
