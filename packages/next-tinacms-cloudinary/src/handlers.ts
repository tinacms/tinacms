/**

*/

import { v2 as cloudinary } from 'cloudinary'
import type { Media, MediaListOptions } from 'tinacms'
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

export interface CloudinaryOptions {
  useHttps?: boolean
}

export const mediaHandlerConfig = {
  api: {
    bodyParser: false,
  },
}

export const createMediaHandler = (
  config: CloudinaryConfig,
  options?: CloudinaryOptions
) => {
  cloudinary.config(Object.assign({ secure: true }, config))

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await config.authorized(req, res)
    // make sure the user is authorized to upload
    if (!isAuthorized) {
      res.status(401).json({ message: 'sorry this user is unauthorized' })
      return
    }
    switch (req.method) {
      case 'GET':
        return listMedia(req, res, options)
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
        // @ts-ignore
        directory: (req, file, cb) => {
          cb(null, '/tmp')
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname)
        },
      }),
    }).single('file')
  )

  // @ts-ignore
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

async function listMedia(
  req: NextApiRequest,
  res: NextApiResponse,
  opts?: CloudinaryOptions
) {
  try {
    const {
      directory = '""',
      limit = 500,
      offset,
    } = req.query as MediaListOptions

    const useRootDirectory =
      !directory || directory === '/' || directory === '""'

    const query = useRootDirectory ? 'folder=""' : `folder="${directory}"`

    const response = await cloudinary.search
      .expression(query)
      .max_results(limit)
      .next_cursor(offset as string)
      .execute()

    const files = response.resources.map(getCloudinaryToTinaFunc(opts))

    //@ts-ignore TODO: Open PR to cloudinary-core
    cloudinary.api.folders = (directory: string = '""') => {
      if (useRootDirectory) {
        return cloudinary.api.root_folders()
      } else {
        return cloudinary.api.sub_folders(directory)
      }
    }
    let folders: string[] = []
    let folderRes = null

    try {
      // @ts-ignore
      folderRes = await cloudinary.api.folders(directory)
    } catch (e) {
      // If the folder doesn't exist, just return an empty array
      if (e.error?.message.startsWith("Can't find folder with path")) {
        // ignore
      } else {
        console.error('Error getting folders')
        console.error(e)
        throw e
      }
    }

    if (folderRes?.folders) {
      folders = folderRes.folders.map(function (folder: {
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
    }

    res.json({
      items: [...folders, ...files],
      offset: response.next_cursor,
    })
  } catch (e) {
    console.log(e)
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
  const [, public_id] = media as string[]

  cloudinary.uploader.destroy(public_id as string, {}, (err) => {
    if (err) res.status(500)
    res.json({
      err,
      public_id,
    })
  })
}
function getCloudinaryToTinaFunc(opts: CloudinaryOptions) {
  return function cloudinaryToTina(file: any): Media {
    // TODO: I want to use this but it seams we might have to update our webpack config in order to do this in node
    // const useHttps = opts?.useHttps ?? true

    // Default to true
    let useHttps = true
    if (typeof opts !== 'undefined' && typeof opts.useHttps !== 'undefined') {
      useHttps = opts.useHttps
    }

    const sel = useHttps ? ('secure_url' as const) : ('url' as const)

    const filename = path.basename(file.public_id)
    const directory = path.dirname(file.public_id)

    return {
      id: file.public_id,
      filename,
      directory,
      src: file[sel],
      thumbnails: {
        '75x75': transformCloudinaryImage(file[sel], 'w_75,h_75,c_fit,q_auto'),
        '400x400': transformCloudinaryImage(
          file[sel],
          'w_400,h_400,c_fit,q_auto'
        ),
        '1000x1000': transformCloudinaryImage(
          file[sel],
          'w_1000,h_1000,c_fit,q_auto'
        ),
      },
      type: 'file',
    }
  }
}

function transformCloudinaryImage(
  url: string,
  transformations: string
): string {
  const parts = url.split('/image/upload/')

  if (parts.length === 2) {
    return parts[0] + '/image/upload/' + transformations + '/' + parts[1]
  }

  return url
}
