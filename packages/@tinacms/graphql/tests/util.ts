import { MemoryLevel } from 'memory-level'
import {
  createDatabaseInternal,
  FilesystemBridge,
  resolve,
  buildSchema,
} from '../src'

class OutputBridge extends FilesystemBridge {
  async put(_filepath: string, data: string) {
    super.put(`out.md`, data)
  }
}

export const setup = async (dir: string, config: any) => {
  const bridge = new OutputBridge(dir, dir)
  const level = new MemoryLevel<string, Record<string, any>>()
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  })
  await database.indexContent(await buildSchema(config))
  const get = async () => {
    const res2 = await resolve({
      database,
      query: `query { document(collection: "post", relativePath: "in.md") { ...on Document { _values }} }`,
      variables: {},
    })
    if (res2.errors) {
      console.error(res2.errors)
    }

    const { _collection, _template, ...data } = res2?.data?.document._values
    return data
  }
  const put = async (input: any) => {
    const res2 = await resolve({
      database,
      query: `mutation Update($params: DocumentUpdateMutation!) { updateDocument(collection: "post", relativePath: "in.md", params: $params) {...on Document{_values}} }`,
      variables: {
        params: { post: input },
      },
    })
    if (res2.errors) {
      console.error(res2.errors)
    }

    const { _collection, _template, ...data } =
      res2?.data?.updateDocument._values
    return data
  }
  return { get, put }
}

export const format = (data: any) => {
  return JSON.stringify(data, null, 2)
}
