export const hasRTLChar = (text: string): boolean => {
  return /[\u0600-\u06ef]/g.test(text)
}

export const getDirection = (
  value: number | string | boolean | readonly string[]
) => {
  if (typeof value === 'string') {
    return hasRTLChar(value) ? 'rtl' : 'ltr'
  }
  return 'unset'
}
