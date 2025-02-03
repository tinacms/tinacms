import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  BlobSASPermissions,
} from '@azure/storage-blob'
import sharp from 'sharp'
import type { AzureBlobStorageConfig } from './types'
import { type NextRequest, NextResponse } from 'next/server'

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
]

type RouteParams = { params: { path: string[] } }

export const createMediaDeliveryHandlers = (config: AzureBlobStorageConfig) => {
  return {
    async GET(req: NextRequest, context: RouteParams) {
      try {
        // Extract the account name and key from the connection string manually
        const accountNameMatch = /AccountName=([^;]+)/.exec(
          config.connectionString
        )
        const accountKeyMatch = /AccountKey=([^;]+)/.exec(
          config.connectionString
        )

        if (!accountNameMatch || !accountKeyMatch) {
          throw new Error(
            'Invalid connection string: Missing AccountName or AccountKey.'
          )
        }

        const accountName = accountNameMatch[1]
        const accountKey = accountKeyMatch[1]

        // Create shared key credentials
        const sharedKeyCredential = new StorageSharedKeyCredential(
          accountName,
          accountKey
        )

        const client = BlobServiceClient.fromConnectionString(
          config.connectionString
        )
        const containerClient = client.getContainerClient(config.containerName)
        const blobName = context.params.path.join('/')
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        // Define SAS token options
        const expiresOn = new Date()
        expiresOn.setMinutes(expiresOn.getMinutes() + 1) // Token valid for 1 minute

        const sasToken = generateBlobSASQueryParameters(
          {
            containerName: config.containerName, // The container name
            blobName, // The blob name
            permissions: BlobSASPermissions.parse('r'), // Read permission
            expiresOn, // Expiration time
          },
          sharedKeyCredential
        ).toString()

        const response = await fetch(`${blockBlobClient.url}?${sasToken}`)
        if (!response.ok) {
          console.error(
            `Failed to fetch original image: ${response.status} ${response.statusText}`
          )
          return new NextResponse(
            `Failed to fetch original image: ${response.status} ${response.statusText}`,
            { status: response.status }
          )
        }

        const contentType = response.headers.get('content-type')
        const isImage = SUPPORTED_IMAGE_TYPES.includes(contentType || '')

        if (!isImage) {
          // For non-image files, return the file as-is
          console.log(`Serving non-image file: ${contentType}`)
          const fileBuffer = await response.arrayBuffer()
          const headers = new Headers(response.headers)
          headers.set('cache-control', 'public, max-age=31536000, immutable')
          return new NextResponse(fileBuffer, {
            status: response.status,
            statusText: response.statusText,
            headers,
          })
        }

        // For images, proceed with optimization
        const buffer = await response.arrayBuffer()

        const url = new URL(req.url)
        const width = url.searchParams.get('w')
        const height = url.searchParams.get('h')
        const quality = Number(url.searchParams.get('q') || '80')
        const format = url.searchParams.get('fmt') || 'auto'

        // Input validation
        if (width && Number.isNaN(Number(width))) {
          return new NextResponse('Invalid width parameter', { status: 400 })
        }
        if (height && Number.isNaN(Number(height))) {
          return new NextResponse('Invalid height parameter', { status: 400 })
        }
        if (Number.isNaN(quality) || quality < 1 || quality > 100) {
          return new NextResponse('Invalid quality parameter', { status: 400 })
        }

        let processedImage = sharp(buffer)

        if (width || height) {
          processedImage = processedImage.resize({
            width: width ? Number(width) : undefined,
            height: height ? Number(height) : undefined,
            fit: 'inside',
            withoutEnlargement: true,
          })
        }

        let outputFormat: keyof sharp.FormatEnum = 'jpeg'
        let outputContentType = 'image/jpeg'

        if (
          format === 'webp' ||
          (format === 'auto' &&
            req.headers.get('accept')?.includes('image/webp'))
        ) {
          outputFormat = 'webp'
          outputContentType = 'image/webp'
        } else if (
          format === 'avif' ||
          (format === 'auto' &&
            req.headers.get('accept')?.includes('image/avif'))
        ) {
          outputFormat = 'avif'
          outputContentType = 'image/avif'
        }

        try {
          processedImage = processedImage[outputFormat]({ quality })
          const processedBuffer = await processedImage.toBuffer()

          const headers = new Headers(response.headers)
          headers.set('content-type', outputContentType)
          headers.set('content-length', processedBuffer.length.toString())
          headers.set('cache-control', 'public, max-age=31536000, immutable')

          return new NextResponse(processedBuffer, {
            status: response.status,
            statusText: response.statusText,
            headers,
          })
        } catch (sharpError) {
          console.error('Error processing image with sharp:', sharpError)

          // Fallback to original image if optimization fails
          console.warn('Falling back to original image')
          const originalBuffer = Buffer.from(buffer)
          const headers = new Headers(response.headers)
          headers.set('content-type', contentType || 'application/octet-stream')
          headers.set('content-length', originalBuffer.length.toString())
          headers.set('cache-control', 'public, max-age=3600') // Shorter cache time for unoptimized images

          return new NextResponse(originalBuffer, {
            status: response.status,
            statusText: response.statusText,
            headers,
          })
        }
      } catch (error) {
        console.error('Unexpected error in image processing:', error)
        return new NextResponse('Unexpected error in image processing', {
          status: 500,
        })
      }
    },
  }
}
