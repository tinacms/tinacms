const fs = require('fs')
const path = require('path')

let waitingForBuild = false
let nextArgs: any = null
let count = 0

const MAX_BUILD_TIME = 1000

export function writeFile(pathRoot: string, data: any) {
  count++
  console.info(`request ${count} received`)
  cacheCommand(pathRoot, data)
  tryToWrite()
}

function cacheCommand(pathRoot: string, data: any) {
  let prevCacheNumber = count - 1
  console.info(`caching ${count}: start`)
  if (nextArgs) {
    console.info(`caching ${count}: discarding ${prevCacheNumber}`)
  }
  nextArgs = [pathRoot, data]
  console.info(`caching ${count}: end`)
}

function tryToWrite() {
  if (!nextArgs) return

  let curr = count
  console.info(`write ${curr}: start`)
  if (waitingForBuild) {
    console.info(`write ${curr}: waiting for gatsby`)
    return
  }

  let [pathRoot, data] = nextArgs
  waitingForBuild = true
  nextArgs = null

  let filePath = path.join(pathRoot, data.fileRelativePath)
  fs.writeFile(filePath, data.content, (err: any) => {
    if (err) {
      console.info(`write ${curr}: end; failure`)
      waitingForBuild = false
    } else {
      console.info(`write ${curr}: end; success`)
      waitingForBuild = true
      // Temp solution; we haven't figured out how to
      // call `buildFinished` when Gatsby's build actually
      // finishes.
      setTimeout(buildFinished, MAX_BUILD_TIME)
    }
  })
}

function buildFinished() {
  console.info(`build finished`)
  waitingForBuild = false
  tryToWrite()
}
