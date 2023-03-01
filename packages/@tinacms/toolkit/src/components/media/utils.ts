export const dropzoneAcceptFromString = (str: string) => {
  return Object.assign(
    {},
    ...(str || 'text/*,application/pdf,image/*')
      .split(',')
      .map((x) => ({ [x]: [] }))
  )
}

export const isImage = (filename: string): boolean => {
  // http://stackoverflow.com/questions/10473185/regex-javascript-image-file-extension
  return /\.(gif|jpg|jpeg|tiff|png|svg|webp)$/i.test(filename)
}
