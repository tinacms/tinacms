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

import { Router } from 'express'
import { join } from 'path'
import multer from 'multer'
import { MediaModel, PathConfig } from '../models/media'

export const createMediaRouter = (config: PathConfig): Router => {
  const mediaFolder = join(process.cwd(), config.publicFolder, config.mediaRoot)
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

  mediaRouter.post('/upload/*', upload.single('file'), function (req, res) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
    res.json({ success: true })
  })

  return mediaRouter
}
