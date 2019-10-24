/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

const fs = require('fs')
const path = require('path')

let waitingForBuild = false
let nextArgs: any = null
let count = 0

const MAX_BUILD_TIME = 1000

export function writeFile(filepath: string, content: string) {
  count++
  cacheCommand(filepath, content)
  tryToWrite()
}

export function deleteFile(path: string) {
  fs.unlinkSync(path)
}

function cacheCommand(filepath: string, data: any) {
  const prevCacheNumber = count - 1
  if (DEBUG) {
    console.info(`caching ${count}: start`)
    if (nextArgs) {
      console.info(`caching ${count}: discarding ${prevCacheNumber}`)
    }
  }
  nextArgs = [filepath, data]
  if (DEBUG) console.info(`caching ${count}: end`)
}

function tryToWrite() {
  if (!nextArgs) return

  const curr = count
  if (DEBUG) console.info(`write ${curr}: start`)
  if (waitingForBuild) {
    if (DEBUG) console.info(`write ${curr}: waiting for gatsby`)
    return
  }

  const [filepath, content] = nextArgs
  waitingForBuild = true
  nextArgs = null

  const parentDir = path.dirname(filepath)
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true })
  }
  fs.writeFile(filepath, content, (err: any) => {
    if (err) {
      if (DEBUG) console.info(`write ${curr}: end; failure`)
      console.error(err)
      waitingForBuild = false
    } else {
      if (DEBUG) console.info(`write ${curr}: end; success`)
      waitingForBuild = true
      // Temp solution; we haven't figured out how to
      // call `buildFinished` when Gatsby's build actually
      // finishes.
      setTimeout(buildFinished, MAX_BUILD_TIME)
    }
  })
}

function buildFinished() {
  if (DEBUG) console.info(`build finished`)
  waitingForBuild = false
  tryToWrite()
}
