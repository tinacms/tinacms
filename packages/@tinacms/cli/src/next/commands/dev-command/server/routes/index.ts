import fs from 'fs'
import path from 'path'
import busboy from 'busboy'
import { MediaModel, PathConfig } from '../models/media'
import type { Connect } from 'vite'
import type { ServerResponse } from 'http'

export const createMediaRouter = (config: PathConfig) => {
  const mediaFolder = path.join(
    config.rootPath,
    config.publicFolder,
    config.mediaRoot
  )

  const mediaModel = new MediaModel(config)

  const handleList = async (req, res) => {
    const requestURL = new URL(req.url, config.apiURL)
    const folder = requestURL.pathname.replace('/media/list/', '')
    const limit = requestURL.searchParams.get('limit')
    const cursor = requestURL.searchParams.get('cursor')
    const media = await mediaModel.listMedia({
      searchPath: folder,
      cursor,
      limit,
    })
    res.end(JSON.stringify(media))
  }

  const handleDelete = async (req: Connect.IncomingMessage, res) => {
    const file = decodeURIComponent(req.url.slice('/media/'.length))
    const didDelete = await mediaModel.deleteMedia({ searchPath: file })
    res.end(JSON.stringify(didDelete))
  }

  const handlePost = async function (
    req: Connect.IncomingMessage,
    res: ServerResponse
  ) {
    const bb = busboy({ headers: req.headers })

    bb.on('file', (name, file, info) => {
      const saveTo = path.join(mediaFolder, info.filename)
      file.pipe(fs.createWriteStream(saveTo))
    })
    bb.on('error', (error) => {
      res.statusCode = 500
      if (error instanceof Error) {
        res.end(JSON.stringify({ message: error }))
      } else {
        res.end(JSON.stringify({ message: 'Unknown error while uploading' }))
      }
    })
    bb.on('close', () => {
      res.statusCode = 200
      res.end(JSON.stringify({ success: true }))
    })
    req.pipe(bb)
  }

  return { handleList, handleDelete, handlePost }
}
