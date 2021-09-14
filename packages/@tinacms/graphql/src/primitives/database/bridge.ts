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
import fg from 'fast-glob'
import path from 'path'
import normalize from 'normalize-path'
import * as yup from 'yup'
import matter from 'gray-matter'
import { assertShape } from '../util'

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for Github has well.
 */
export class FilesystemBridge implements Bridge {
  public rootPath: string
  constructor(rootPath: string) {
    this.rootPath = rootPath || ''
  }
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
  public async print() {}
  public async get(filepath: string) {
    const contentString = await fs
      .readFileSync(path.join(this.rootPath, filepath))
      .toString()
    const extension = path.extname(filepath)
    const contentObject = this.parseFile<{ [key: string]: unknown }>(
      contentString,
      extension,
      (yup) => yup.object({})
    )
    return contentObject
  }
  public async put(
    filepath: string,
    data: object,
    options?: {
      includeTemplate?: boolean
    }
  ) {
    const extension = path.extname(filepath)
    const stringData = this.stringifyFile(
      data,
      extension,
      !!options?.includeTemplate
    )
    await fs.outputFileSync(path.join(this.rootPath, filepath), stringData)
  }
  private stringifyFile = (
    content: object,
    format: FormatType | string, // FIXME
    /** For non-polymorphic documents we don't need the template key */
    keepTemplateKey: boolean
  ): string => {
    switch (format) {
      case '.markdown':
      case '.md':
        // @ts-ignore
        const { _id, _template, _collection, $_body, ...rest } = content
        const extra: { [key: string]: string } = {}
        if (keepTemplateKey) {
          extra['_template'] = _template
        }
        return matter.stringify($_body || '', { ...rest, ...extra })
      case '.json':
        return JSON.stringify(content, null, 2)
      default:
        throw new Error(`Must specify a valid format, got ${format}`)
    }
  }

  private parseFile = <T extends object>(
    content: string,
    format: FormatType | string, // FIXME
    yupSchema: (args: typeof yup) => yup.ObjectSchema<any>
  ): T => {
    switch (format) {
      case '.markdown':
      case '.md':
        const contentJSON = matter(content || '')
        const markdownData = {
          ...contentJSON.data,
          $_body: contentJSON.content,
        }
        assertShape<T>(markdownData, yupSchema)
        return markdownData
      case '.json':
        if (!content) {
          return {} as T
        }
        return JSON.parse(content)
      default:
        throw new Error(`Must specify a valid format, got ${format}`)
    }
  }
}

export interface Bridge {
  glob(pattern: string): Promise<string[]>
  get(filepath: string): Promise<object>
  put(
    filepath: string,
    data: object,
    options?: {
      includeTemplate?: boolean
    }
  ): Promise<void>
}

type FormatType = 'json' | 'md' | 'markdown' | 'yml' | 'yaml'
