const fs = require('fs')
const path = require('path')

let waitingForBuild = false
let nextArgs: any = null
let count = 0

const MAX_BUILD_TIME = 1000

export function writeFile(filepath: string, content: string) {
  count++
  console.info(`request ${count} received`)
  cacheCommand(filepath, content)
  tryToWrite()
}

export function deleteFile(path: string) {
  fs.unlinkSync(path)
}

function cacheCommand(filepath: string, data: any) {
  let prevCacheNumber = count - 1
  console.info(`caching ${count}: start`)
  if (nextArgs) {
    console.info(`caching ${count}: discarding ${prevCacheNumber}`)
  }
  nextArgs = [filepath, data]
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

  let [filepath, content] = nextArgs
  waitingForBuild = true
  nextArgs = null

  let parentDir = path.dirname(filepath)
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true })
  }
  fs.writeFile(filepath, content, (err: any) => {
    if (err) {
      console.info(`write ${curr}: end; failure`)
      console.error(err)
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
