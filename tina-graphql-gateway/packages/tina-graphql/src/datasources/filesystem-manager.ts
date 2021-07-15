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

import fs from 'fs-extra'
import p from 'path'
import { DataAdaptor } from './data-adaptor'
import _ from 'lodash'
export class FileSystemManager implements DataAdaptor {
  rootPath: string
  constructor({ rootPath }: { rootPath: string }) {
    this.rootPath = rootPath
  }
  readFile = async (path: string) => {
    return fs.readFileSync(path).toString()
  }
  readDir = async (path: string): Promise<string[]> => {
    const result = fs.readdirSync(path)
    return _.flatten(
      await Promise.all(
        result.map(async (item) => {
          const fullPath = p.join(path, item)
          if (fs.lstatSync(fullPath).isDirectory()) {
            const nestedItems = await this.readDir(fullPath)
            return nestedItems.map((nestedItem) => {
              return p.join(item, nestedItem)
            })
          }
          return item
        })
      )
    )
  }
  writeFile = async (path: string, content: string) => {
    return fs.outputFile(path, content)
  }
}
