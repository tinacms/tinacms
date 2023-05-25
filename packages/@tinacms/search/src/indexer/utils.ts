import { Collection, ObjectField } from '@tinacms/schema-tools'

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
      const remaining = this.limit - this.length
      if (remaining > 0) {
        this.buffer.push(str.substring(0, remaining))
        this.length += remaining
      }
      return true
    } else {
      this.buffer.push(str)
      this.length += str.length
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
      if (acc.append(data.text || data.value)) {
        return
      }
    }

    data.children?.forEach((child: any) =>
      extractText(child, acc, indexableNodeTypes)
    )
  }
}

const relativePath = (path: string, collection: Collection<true>) => {
  return path
    .replace(/\\/g, '/')
    .replace(collection.path, '')
    .replace(/^\/|\/$/g, '')
}

export const processDocumentForIndexing = (
  data: any,
  path: string,
  collection: Collection<true>,
  textIndexLength: number,
  field?: ObjectField<true>
) => {
  if (!field) {
    const relPath = relativePath(path, collection)
    data['_id'] = `${collection.name}:${relPath}`
    data['_relativePath'] = relPath
  }
  for (const f of collection.fields || field?.fields || []) {
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
      } else if (f.type === 'image') {
        delete data[f.name]
      } else if (f.type === 'string') {
        if (isList) {
          data[f.name] = data[f.name].map((value: string) =>
            value.substring(0, textIndexLength)
          )
        } else {
          data[f.name] = data[f.name].substring(0, textIndexLength)
        }
      } else if (f.type === 'rich-text') {
        if (isList) {
          data[f.name] = data[f.name].map((value: any) => {
            const acc = new StringBuilder(textIndexLength)
            extractText(value, acc, ['text', 'code_block', 'html'])
            return acc.toString()
          })
        } else {
          const acc = new StringBuilder(textIndexLength)
          extractText(data[f.name], acc, ['text', 'code_block', 'html'])
          data[f.name] = acc.toString()
        }
      }
    }
  }
  return data
}
