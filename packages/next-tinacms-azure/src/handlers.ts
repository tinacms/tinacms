import {
  type BlobDeleteOptions,
  type BlobPrefix,
  BlobServiceClient,
} from '@azure/storage-blob'
import type { AzureBlobStorageConfig } from './types'
import type { MediaListOptions } from 'tinacms'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'

type RouteParams = { params: { media: string[] } }

export const createMediaHandlers = (config: AzureBlobStorageConfig) => {
  function withAuth(
    handler: (
      request: NextRequest,
      context?: RouteParams
    ) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context?: RouteParams) => {
      const authResult = await config.authorized(request)
      if (!authResult)
        return NextResponse.json(
          { message: 'sorry this user is unauthorized' },
          { status: 401 }
        )
      return await handler(request, context)
    }
  }

  return {
    GET(req: NextRequest) {
      return withAuth((req) => listMedia(req, config))(req)
    },
    POST(req: NextRequest) {
      return withAuth((req) => uploadMedia(req, config))(req)
    },
    DELETE(req: NextRequest, context?: RouteParams) {
      return withAuth((req) => deleteAsset(req, context, config))(req)
    },
  }
}

async function uploadMedia(req: NextRequest, config: AzureBlobStorageConfig) {
  const client = BlobServiceClient.fromConnectionString(config.connectionString)
  const containerClient = client.getContainerClient(config.containerName)

  const formData = await req.formData()
  const directory = formData.get('directory') as string
  const filename = formData.get('filename') as string
  const file = formData.get('file') as Blob | null
  if (!file) {
    return NextResponse.json(
      { error: 'File blob is required.' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const blobName = path.join(directory, filename)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.uploadData(buffer)

  return NextResponse.json({
    name: blobName,
    filename,
    url: `/media/${blobName}`,
  })
}

async function deleteAsset(
  _: NextRequest,
  context: RouteParams,
  config: AzureBlobStorageConfig
): Promise<NextResponse> {
  const { media } = context.params
  const [, blobName] = media

  const options: BlobDeleteOptions = {
    deleteSnapshots: 'include',
  }

  const client = BlobServiceClient.fromConnectionString(config.connectionString)
  const containerClient = client.getContainerClient(config.containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.deleteIfExists(options)

  return NextResponse.json({
    blobName,
  })
}

async function listMedia(req: NextRequest, config: AzureBlobStorageConfig) {
  try {
    const client = BlobServiceClient.fromConnectionString(
      config.connectionString
    )
    const containerClient = client.getContainerClient(config.containerName)

    const mediaListOptions: MediaListOptions = {
      directory: (req.nextUrl.searchParams.get('directory') as string) || '""',
      limit:
        Number.parseInt(req.nextUrl.searchParams.get('limit') as string, 10) ||
        500,
      offset: req.nextUrl.searchParams.get('offset') as string,
      filesOnly: req.nextUrl.searchParams.get('filesOnly') === 'true' || false,
    }

    const useRootDirectory =
      !mediaListOptions.directory ||
      mediaListOptions.directory === '/' ||
      mediaListOptions.directory === '""'

    const prefix = useRootDirectory
      ? ''
      : mediaListOptions.directory?.endsWith('/')
        ? mediaListOptions.directory
        : `${mediaListOptions.directory}/`

    const files = []
    const folders = []
    for await (const blob of containerClient.listBlobsByHierarchy('/', {
      prefix,
    })) {
      if (blob.kind === 'prefix') {
        folders.push(blob)
      } else {
        files.push({
          ...blob,
          url: `/media/${blob.name}`,
        })
      }
    }

    if (mediaListOptions.filesOnly) {
      return NextResponse.json({
        items: files.map(mapFile),
      })
    }
    return NextResponse.json({
      items: [...folders.map(mapFolder), ...files.map(mapFile)],
    })
  } catch (e) {
    return NextResponse.json({ e }, { status: 500 })
  }
}

const mapFolder = (blob: { kind: 'prefix' } & BlobPrefix) => ({
  id: blob.name,
  type: 'dir',
  filename: path.basename(blob.name),
  directory: path.dirname(blob.name),
})

const mapFile = (blob: { kind: 'blob'; url: string } & BlobPrefix) => ({
  id: blob.name,
  type: 'file',
  filename: path.basename(blob.name),
  directory: path.dirname(blob.name),
  src: blob.url,
  thumbnails: {
    '75x75': blob.url,
    '400x400': blob.url,
    '1000x1000': blob.url,
  },
})
