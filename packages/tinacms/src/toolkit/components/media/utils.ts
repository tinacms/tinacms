const supportedFileTypes = [
  'text/*',
  'application/pdf',
  'application/octet-stream',
  'application/json',
  'application/ld+json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/postscript',
  'model/fbx',
  'model/gltf+json',
  'model/ply',
  'model/u3d+mesh',
  'model/vnd.usdz+zip',
  'application/x-indesign',
  'application/vnd.apple.mpegurl',
  'application/dash+xml',
  'application/mxf',
  'image/*',
  'video/*',
]
export const DEFAULT_MEDIA_UPLOAD_TYPES = supportedFileTypes.join(',')

export const dropzoneAcceptFromString = (str: string) => {
  return Object.assign(
    {},
    ...(str || DEFAULT_MEDIA_UPLOAD_TYPES).split(',').map((x) => ({ [x]: [] }))
  )
}

export const isImage = (filename: string): boolean => {
  // http://stackoverflow.com/questions/10473185/regex-javascript-image-file-extension
  // (\?.*)? is to match query strings (like from tina cloud)
  return /\.(gif|jpg|jpeg|tiff|png|svg|webp|avif)(\?.*)?$/i.test(filename)
}

export const isVideo = (filename: string): boolean => {
  return /\.(mp4|webm|ogg|m4v|mov|avi|flv|mkv)(\?.*)?$/i.test(filename)
}

export const absoluteImgURL = (str: string) => {
  if (str.startsWith('http')) return str
  return `${window.location.origin}${str}`
}
