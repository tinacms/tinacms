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

import { v2 as cloudinary } from 'cloudinary'
import { Media, MediaListOptions } from '@tinacms/toolkit'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import { promisify } from 'util'

export interface CloudinaryConfig {
  cloud_name: string
  api_key: string
  api_secret: string
  authorized: (req: NextApiRequest, res: NextApiResponse) => Promise<boolean>
}

export const mediaHandlerConfig = {
  api: {
    bodyParser: false,
  },
}

export const createMediaHandler = (config: CloudinaryConfig) => {
  cloudinary.config(config)

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await config.authorized(req, res)
    // make sure the user is authorized to upload
    if (!isAuthorized) {
      res.status(401).json({ message: 'sorry this user is unauthorized' })
      return
    }
    switch (req.method) {
      case 'GET':
        return listMedia(req, res)
      case 'POST':
        return uploadMedia(req, res)
      case 'DELETE':
        return deleteAsset(req, res)
      default:
        res.end(404)
    }
  }
}

async function uploadMedia(req: NextApiRequest, res: NextApiResponse) {
  const upload = promisify(
    multer({
      storage: multer.diskStorage({
        directory: (req, file, cb) => {
          cb(null, '/tmp')
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname)
        },
      }),
    }).single('file')
  )

  await upload(req, res)

  const { directory } = req.body

  //@ts-ignore
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: directory.replace(/^\//, ''),
    use_filename: true,
    overwrite: false,
  })

  res.json(result)
}

async function listMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      directory = '""',
      limit = 500,
      offset,
    } = req.query as MediaListOptions

    const query = `folder=${directory}`

    const response = await cloudinary.search
      .expression(query)
      .max_results(limit)
      .next_cursor(offset as string)
      .execute()

    const files = response.resources.map(cloudinaryToTina)

    //@ts-ignore TODO: Open PR to cloudinary-core
    cloudinary.api.folders = (directory: string = '""') => {
      if (directory === '""') {
        return cloudinary.api.root_folders()
      } else {
        return cloudinary.api.sub_folders(directory)
      }
    }

    // @ts-ignore
    let { folders } = await cloudinary.api.folders(directory)

    folders = folders.map(function (folder: {
      name: string
      path: string
    }): Media {
      'empty-repo/004'
      return {
        id: folder.path,
        type: 'dir',
        filename: path.basename(folder.path),
        directory: path.dirname(folder.path),
      }
    })

    res.json({
      items: [...folders, ...files],
      offset: response.next_cursor,
    })
  } catch (e) {
    res.status(500)
    const message = findErrorMessage(e)
    res.json({ e: message })
  }
}

/**
 * we're getting inconsistent errors in this try-catch
 * sometimes we just get a string, sometimes we get the whole response.
 * I suspect this is coming from Cloudinary SDK so let's just try to
 * normalize it into a string here.
 */
const findErrorMessage = (e: any) => {
  if (typeof e == 'string') return e
  if (e.message) return e.message
  if (e.error && e.error.message) return e.error.message
  return 'an error occurred'
}

async function deleteAsset(req: NextApiRequest, res: NextApiResponse) {
  const { media } = req.query
  const [_media, public_id] = media

  cloudinary.uploader.destroy(public_id as string, {}, (err) => {
    if (err) res.status(500)
    res.json({
      err,
      public_id,
    })
  })
}

function cloudinaryToTina(file: any): Media {
  const filename = path.basename(file.public_id)
  const directory = path.dirname(file.public_id)

  return {
    id: file.public_id,
    filename,
    directory,
    previewSrc: file.url,
    type: 'file',
  }
}
