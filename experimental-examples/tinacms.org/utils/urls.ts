export function fileToUrl(filepath: string, base: string = null) {
  if (base) {
    filepath = filepath.split(`/${base}/`)[1]
  }
  const index = filepath.lastIndexOf('.')
  return filepath.replace(/ /g, '-').slice(0, index).trim()
}

const everythingBeforeTheHash = /(.*)#.*$/
const everythingBeforeTheQuery = /(.*)\?.*$/
const everythingExceptTheTrailingSlash = /(.*)\/$/

function createReplacer(expr: RegExp) {
  return (url: string) => {
    if (!url) return url
    return url.replace(expr, '$1')
  }
}

const removeHash = createReplacer(everythingBeforeTheHash)
const removeQuery = createReplacer(everythingBeforeTheQuery)
const removeTrailingSlash = createReplacer(everythingExceptTheTrailingSlash)

/**
 * returns true if @url1 and @url2 go to the same place
 * (after stripping any query, hash, and trailing slash in each)
 */
export function matchActualTarget(url1: string, url2: string) {
  const formattedUrl1 = removeTrailingSlash(removeQuery(removeHash(url1)))
  const formattedUrl2 = removeTrailingSlash(removeQuery(removeHash(url2)))
  return formattedUrl1 === formattedUrl2
}
