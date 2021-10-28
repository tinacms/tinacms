/**
Copyright 2021 Forestry.io Holdings, Inc.
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

import fg from 'fast-glob'
import fs from 'fs-extra'
import path from 'path'
import normalize from 'normalize-path'
import type { Store } from './index'

export class FileSystemStore implements Store {
  public rootPath
  public db
  constructor(rootPath: string) {
    this.rootPath = rootPath || ''
    const base = path.join('.tina', 'fsStore')
    this.db = {
      get: async (filepath) => {
        const content = await fs
          .readFileSync(path.join(base, filepath))
          .toString()
        return JSON.parse(content)
      },
      put: async (filepath, content) => {
        return fs.outputFileSync(
          path.join(base, filepath),
          JSON.stringify(content, null, 2)
        )
      },
    }
  }
  public async print() {}
  public async clear() {
    await fs.rmdirSync(path.join('.tina', 'fsdb'), { recursive: true })
  }
  // FIXME: we're cheating here by using fg,
  // need a custom function for this to work on the server
  public async glob(pattern: string) {
    const basePath = path.join(this.rootPath, ...pattern.split('/'))
    const items = await fg(
      path.join(basePath, '**', '/*').replace(/\\/g, '/'),
      {
        dot: true,
      }
    )
    const posixRootPath = normalize(this.rootPath)
    return items.map((item) => {
      return item.replace(posixRootPath, '').replace(/^\/|\/$/g, '')
    })
  }
  public async get(filepath: string) {
    const content = await this.db.get(filepath)
    return content
  }
  public async put(filepath: string, data: object) {
    await this.db.put(filepath, data, { valueEncoding: 'json' })
  }
}
