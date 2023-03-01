export const dropzoneAcceptFromString = (str: string) => {
  return Object.assign(
    {},
    ...(str || 'text/*,application/pdf,image/*')
      .split(',')
      .map((x) => ({ [x]: [] }))
  )
}
