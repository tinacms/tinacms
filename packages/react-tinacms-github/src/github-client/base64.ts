const btoa = require('btoa')

export const b64EncodeUnicode = (str: string) => {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(
      _match,
      p1
    ) {
      return String.fromCharCode(parseInt(p1, 16))
    })
  )
}
