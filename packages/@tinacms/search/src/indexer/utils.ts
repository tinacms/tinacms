import { Collection, ObjectField } from '@tinacms/schema-tools'
import * as sw from 'stopword'

class StringBuilder {
  private readonly buffer: string[]
  public length = 0
  private readonly limit: number
  constructor(limit: number) {
    this.buffer = []
    this.limit = limit
  }

  public append(str: string) {
    if (this.length + str.length > this.limit) {
      return true
    } else {
      this.buffer.push(str)
      this.length += str.length
      if (this.length > this.limit) {
        return true
      }
      return false
    }
  }

  public toString() {
    // NOTE this is going to add some length to the final string beyond the limit
    return this.buffer.join(' ')
  }
}

const extractText = (
  data: any,
  acc: StringBuilder,
  indexableNodeTypes: string[]
) => {
  if (data) {
    if (
      indexableNodeTypes.indexOf(data.type) !== -1 &&
      (data.text || data.value)
    ) {
      const tokens = tokenizeString(data.text || data.value)
      for (const token of tokens) {
        if (acc.append(token)) {
          return
        }
      }
    }

    data.children?.forEach?.((child: any) =>
      extractText(child, acc, indexableNodeTypes)
    )
  }
}

const relativePath = (path: string, collection: Collection) => {
  return path
    .replace(/\\/g, '/')
    .replace(collection.path, '')
    .replace(/^\/|\/$/g, '')
}

const tokenizeString = (str: string) => {
  return str
    .split(/[\s\.,]+/)
    .map((s) => s.toLowerCase())
    .filter((s) => s)
}

const processTextFieldValue = (value: string, maxLen: number) => {
  const tokens = tokenizeString(value)
  const builder = new StringBuilder(maxLen)
  for (const part of tokens) {
    if (builder.append(part)) {
      break
    }
  }
  return builder.toString()
}

export const processDocumentForIndexing = (
  data: any,
  path: string,
  collection: Collection,
  textIndexLength: number,
  field?: ObjectField
) => {
  if (!field) {
    const relPath = relativePath(path, collection)
    data['_id'] = `${collection.name}:${relPath}`
    data['_relativePath'] = relPath
  }
  for (const f of field?.fields || collection.fields || []) {
    if (!f.searchable) {
      delete data[f.name]
      continue
    }
    const isList = f.list
    if (data[f.name]) {
      if (f.type === 'object') {
        if (isList) {
          data[f.name] = data[f.name].map((obj: any) =>
            processDocumentForIndexing(
              obj,
              path,
              collection,
              textIndexLength,
              f
            )
          )
        } else {
          data[f.name] = processDocumentForIndexing(
            data[f.name],
            path,
            collection,
            textIndexLength,
            f
          )
        }
      } else if (f.type === 'string') {
        const fieldTextIndexLength =
          f.maxSearchIndexFieldLength || textIndexLength
        if (isList) {
          data[f.name] = data[f.name].map((value: string) =>
            processTextFieldValue(value, fieldTextIndexLength)
          )
        } else {
          data[f.name] = processTextFieldValue(
            data[f.name],
            fieldTextIndexLength
          )
        }
      } else if (f.type === 'rich-text') {
        const fieldTextIndexLength =
          f.maxSearchIndexFieldLength || textIndexLength
        if (isList) {
          data[f.name] = data[f.name].map((value: any) => {
            const acc = new StringBuilder(fieldTextIndexLength)
            extractText(value, acc, ['text', 'code_block', 'html'])
            return acc.toString()
          })
        } else {
          const acc = new StringBuilder(fieldTextIndexLength)
          extractText(data[f.name], acc, ['text', 'code_block', 'html'])
          data[f.name] = acc.toString()
        }
      }
    }
  }
  return data
}

const memo: Record<string, string[]> = {}
export const lookupStopwords = (
  keys?: string[],
  defaultStopWords: string[] = sw.eng
) => {
  let stopwords = defaultStopWords
  if (keys) {
    if (memo[keys.join(',')]) {
      return memo[keys.join(',')]
    }
    stopwords = []
    for (const key of keys) {
      stopwords.push(...sw[key])
    }
    memo[keys.join(',')] = stopwords
  }
  return stopwords
}
