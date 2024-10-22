/**

*/

import {
  _Object,
  S3Client,
  S3ClientConfig,
  ListObjectsCommand,
  ListObjectsCommandInput,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Media, MediaListOptions } from 'tinacms'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

export interface S3Config {
  config: S3ClientConfig
  bucket: string
  mediaRoot?: string
  authorized: (_req: NextApiRequest, _res: NextApiResponse) => Promise<boolean>
}

export interface S3Options {
  cdnUrl?: string
}

export const mediaHandlerConfig = {
  api: {
    bodyParser: false,
  },
}

export const createMediaHandler = (config: S3Config, options?: S3Options) => {
  const client = new S3Client(config.config)
  const bucket = config.bucket
  const region = config.config.region || 'us-east-1'
  let mediaRoot = config.mediaRoot || ''
  if (mediaRoot) {
    if (!mediaRoot.endsWith('/')) {
      mediaRoot = mediaRoot + '/'
    }
    if (mediaRoot.startsWith('/')) {
      mediaRoot = mediaRoot.substr(1)
    }
  }
  const endpoint =
    config.config.endpoint || `https://s3.${region}.amazonaws.com`
  let cdnUrl =
    options?.cdnUrl ||
    endpoint.toString().replace(/http(s|):\/\//i, `https://${bucket}.`)
  cdnUrl = cdnUrl + (cdnUrl.endsWith('/') ? '' : '/')

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await config.authorized(req, res)
    // make sure the user is authorized to upload
    if (!isAuthorized) {
      res.status(401).json({ message: 'sorry this user is unauthorized' })
      return
    }
    switch (req.method) {
      case 'GET':
        if (req.url.startsWith('/api/s3/media/upload_url')) {
          const expiresIn: number =
            (req.query.expiresIn && Number(req.query.expiresIn)) || 3600
          const s3_key = req.query.key
            ? Array.isArray(req.query.key)
              ? req.query.key[0]
              : req.query.key
            : null
          if (!s3_key) {
            return res.status(400).json({ message: 'key is required' })
          }
          if (await keyExists(client, bucket, s3_key)) {
            return res.status(400).json({ message: 'key already exists' })
          }
          const signedUrl = await getUploadUrl(
            bucket,
            s3_key,
            expiresIn,
            client
          )

          return res.json({ signedUrl, src: cdnUrl + s3_key })
        } else {
          return listMedia(req, res, client, bucket, mediaRoot, cdnUrl)
        }
      case 'DELETE':
        return deleteAsset(req, res, client, bucket)
      default:
        res.end(404)
    }
  }
}

function stripMediaRoot(mediaRoot: string, key: string) {
  if (!mediaRoot) {
    return key
  }
  const mediaRootParts = mediaRoot.split('/').filter((part) => part)
  if (!mediaRootParts || !mediaRootParts[0]) {
    return key
  }
  const keyParts = key.split('/').filter((part) => part)
  // remove each part of the key that matches the mediaRoot parts
  for (let i = 0; i < mediaRootParts.length; i++) {
    if (keyParts[0] === mediaRootParts[i]) {
      keyParts.shift()
    }
  }
  return keyParts.join('/')
}

async function listMedia(
  req: NextApiRequest,
  res: NextApiResponse,
  client: S3Client,
  bucket: string,
  mediaRoot: string,
  cdnUrl: string
) {
  try {
    const {
      directory = '',
      limit = 500,
      offset,
    } = req.query as MediaListOptions

    let prefix = directory.replace(/^\//, '').replace(/\/$/, '')
    if (prefix) prefix = prefix + '/'

    const params: ListObjectsCommandInput = {
      Bucket: bucket,
      Delimiter: '/',
      Prefix: mediaRoot ? path.join(mediaRoot, prefix) : prefix,
      Marker: offset?.toString(),
      MaxKeys: directory && !offset ? +limit + 1 : +limit,
    }

    const command = new ListObjectsCommand(params)

    const response = await client.send(command)

    const items = []

    response.CommonPrefixes?.forEach(({ Prefix }) => {
      const strippedPrefix = stripMediaRoot(mediaRoot, Prefix)
      if (!strippedPrefix) {
        return
      }
      items.push({
        id: Prefix,
        type: 'dir',
        filename: path.basename(strippedPrefix),
        directory: path.dirname(strippedPrefix),
      })
    })

    items.push(
      ...(response.Contents || [])
        .filter((file) => {
          const strippedKey = stripMediaRoot(mediaRoot, file.Key)
          return strippedKey !== prefix
        })
        .map(getS3ToTinaFunc(cdnUrl, mediaRoot))
    )

    res.json({
      items,
      offset: response.NextMarker,
    })
  } catch (e) {
    // Show the error to the user
    console.error('Error listing media')
    console.error(e)
    res.status(500)
    const message = findErrorMessage(e)
    res.json({ e: message })
  }
}

/**
 * we're getting inconsistent errors in this try-catch
 * sometimes we just get a string, sometimes we get the whole response.
 * I suspect this is coming from S3 SDK so let's just try to
 * normalize it into a string here.
 */
const findErrorMessage = (e: any) => {
  if (typeof e == 'string') return e
  if (e.message) return e.message
  if (e.error && e.error.message) return e.error.message
  return 'an error occurred'
}

async function deleteAsset(
  req: NextApiRequest,
  res: NextApiResponse,
  client: S3Client,
  bucket: string
) {
  const { media } = req.query
  const [, objectKey] = media as string[]

  const params: DeleteObjectCommandInput = {
    Bucket: bucket,
    Key: objectKey,
  }
  const command = new DeleteObjectCommand(params)
  try {
    const data = await client.send(command)
    res.json(data)
  } catch (e) {
    console.error('Error deleting media')
    console.error(e)
    res.status(500)
    const message = findErrorMessage(e)
    res.json({ e: message })
  }
}

async function keyExists(client: S3Client, bucket: string, key: string) {
  try {
    const cmd = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    const output: HeadObjectCommandOutput = await client.send(cmd)
    return output && output.$metadata.httpStatusCode === 200
  } catch (error: any) {
    if (error.$metadata?.httpStatusCode === 404) {
      // doesn't exist and permission policy includes s3:ListBucket
      return false
    } else if (error.$metadata?.httpStatusCode === 403) {
      // doesn't exist, permission policy WITHOUT s3:ListBucket
      return false
    } else {
      throw new Error('unexpected error checking if key exists')
    }
  }
}

export const getUploadUrl = async (
  bucket: string,
  key: string,
  expiresIn: number,
  client: S3Client
): Promise<string> => {
  // Create the presigned URL.
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  )
}

function getS3ToTinaFunc(cdnUrl, mediaRoot?: string) {
  return function s3ToTina(file: _Object): Media {
    const strippedKey = stripMediaRoot(mediaRoot, file.Key)
    const filename = path.basename(strippedKey)
    const directory = path.dirname(strippedKey) + '/'

    const src = cdnUrl + file.Key
    return {
      id: file.Key,
      filename,
      directory,
      src: src,
      thumbnails: {
        '75x75': src,
        '400x400': src,
        '1000x1000': src,
      },
      type: 'file',
    }
  }
}
