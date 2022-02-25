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

import {QueryParams, Store} from '.'
import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path'
import normalize from 'normalize-path'
import { stringifyFile, parseFile } from '../util'
import { sequential } from '../../util'

export class FilesystemStore implements Store {
  rootPath: string
  public async clear() {}
  public async print() {}
  constructor({ rootPath }: { rootPath?: string }) {
    this.rootPath = rootPath || ''
  }
  public async query(queryParams: QueryParams, hydrator): Promise<object[]> {
    throw new Error(`Unable to perform query for Filesystem store`)
  }
  public async seed() {
    throw new Error(`Seeding data is not possible for Filesystem store`)
  }

  public async get<T extends object>(filepath: string): Promise<T> {
    return parseFile(
      await fs.readFileSync(path.join(this.rootPath, filepath)).toString(),
      path.extname(filepath),
      (yup) => yup.object()
    )
  }

  public supportsSeeding() {
    return false
  }
  public supportsIndexing() {
    return false
  }
  public async glob(pattern: string, callback) {
    const basePath = path.join(this.rootPath, ...pattern.split('/'))
    const itemsRaw = await fg(
      path.join(basePath, '**', '/*').replace(/\\/g, '/'),
      {
        dot: true,
      }
    )
    const posixRootPath = normalize(this.rootPath)
    const items = itemsRaw.map((item) => {
      return item.replace(posixRootPath, '').replace(/^\/|\/$/g, '')
    })
    if (callback) {
      return sequential(items, async (item) => {
        return callback(item)
      })
    } else {
      return items
    }
  }
  public async put(filepath: string, data: object, options?: { keepTemplateKey: boolean }) {
    await fs.outputFileSync(
      path.join(this.rootPath, filepath),
      stringifyFile(data, path.extname(filepath), options?.keepTemplateKey || false)
    )
  }
}

export class AuditFilesystemStore extends FilesystemStore {
  public async put(_filepath: string, _data: object) {
    return
  }
}
