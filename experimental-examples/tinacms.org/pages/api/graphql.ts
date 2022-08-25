import * as gqlPackage from '@tinacms/graphql'
import * as datalayerPackage from '@tinacms/datalayer'

export default async function feedback(req, res) {
  class InMemoryStore extends datalayerPackage.LevelStore {
    public supportsSeeding() {
      return true
    }
    public supportsIndexing() {
      return false
    }
  }
  class InMemoryBridge {
    public rootPath: string
    private mockFileSystem: { [filepath: string]: string } | undefined
    private content: string
    constructor(rootPath: string, content: string) {
      this.rootPath = rootPath
      this.mockFileSystem = mockFileSystem(content)
      this.content = content
    }
    public glob = async (pattern: string) => {
      return Object.keys(this.mockFileSystem).filter((key) =>
        key.startsWith(pattern)
      )
    }

    public delete = async (filepath: string) => {
      const mockData = await this.getMockData()
      delete mockData[filepath]
    }

    public get = async (filepath: string) => {
      const mockData = await this.getMockData()
      const value = mockData[filepath]
      if (!value) {
        throw new Error(`Unable to find record for ${filepath}`)
      }
      return value
    }
    public put = async (filepath: string, data: string) => {
      const mockData = await this.getMockData()
      this.mockFileSystem = { ...mockData, [filepath]: data }
    }

    public getMockData = async () => {
      return this.mockFileSystem
    }
    public async putConfig(filepath: string, data: string) {
      await this.put(filepath, data)
    }
    public supportsBuilding() {
      return true
    }
  }

  const mockFileSystem = (content: string) => ({
    'posts/hello-world.md': content,
    'authors/pedro.md': `---\nname: Pedro\navatar: https://images.unsplash.com/photo-1555959910-80920d0698a4?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1301&q=80\n---`,
    'authors/napolean.md': `---\nname: Napolean\navatar: https://images.unsplash.com/photo-1606721977440-13e6c3a3505a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=344&q=80\n---`,
  })
  // @ts-ignore
  const schema = JSON.parse(req.query.schema)
  const database = await gqlPackage.createDatabase({
    // @ts-ignore
    bridge: new InMemoryBridge('', req.query.content),
    // @ts-ignore
    store: new InMemoryStore('', true),
  })

  const query = req.query.query
  const variables = req.query.variables
    ? // as string since this can be an array of strings (we're not using it that way)
      JSON.parse(req.query.variables as string)
    : {}
  try {
    await gqlPackage.indexDB({ database, config: schema, buildSDK: false })
    const result = await gqlPackage.resolve({
      database,
      query,
      variables,
    })
    return res.json(result)
  } catch (e) {
    res.status(500)
    return res.json({ errors: [{ message: e.message }] })
  }
}
