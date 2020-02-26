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

import fs from 'fs'
import path from 'path'

let waitingForBuild = false
let count = 0

interface FileChange {
  filepath: string
  content: string | Buffer
}

class FileChangeQueue {
  private pendingChanges: FileChange[] = []

  get length() {
    return this.pendingChanges.length
  }

  addFileChange(change: FileChange) {
    const fileIndex = this.pendingChanges.findIndex(
      ({ filepath }) => change.filepath === filepath
    )
    if (fileIndex < 0) {
      this.pendingChanges.push(change)
    } else {
      this.pendingChanges[fileIndex] = change
    }
  }

  getNextFileChange() {
    return this.pendingChanges.shift()
  }
}

const queue = new FileChangeQueue()

export function writeFile(filepath: string, content: string | Buffer) {
  count++
  cacheCommand(filepath, content)
  tryToWrite()
}

export function deleteFile(path: string) {
  fs.unlinkSync(path)
}

function cacheCommand(filepath: string, data: any) {
  if (DEBUG) {
    console.info(`caching ${count}: start`)
  }
  queue.addFileChange({ filepath, content: data })
  if (DEBUG) console.info(`caching ${count}: end`)
}

function tryToWrite() {
  if (!queue.length) {
    if (DEBUG) console.info(`nothing to write.`)
    return
  }

  const curr = count
  if (DEBUG) console.info(`write ${curr}: start`)
  if (waitingForBuild) {
    if (DEBUG) console.info(`write ${curr}: waiting for gatsby`)
    return
  }

  const { filepath, content } = queue.getNextFileChange() || {
    filepath: '',
    content: '',
  }
  waitingForBuild = true

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
      const TINA_GIT_DEBOUNCE_MS =
        Number(process.env.TINA_GIT_DEBOUNCE_MS) || 1000
      setTimeout(buildFinished, TINA_GIT_DEBOUNCE_MS)
    }
  })
}

function buildFinished() {
  if (DEBUG) console.info(`build finished`)
  waitingForBuild = false
  tryToWrite()
}
