import { buildASTSchema, print } from 'graphql'
import { graphqlHTTP } from 'express-graphql'
import { LevelStore } from '@tinacms/datalayer'
import { createDatabase, resolve, indexDB } from '@tinacms/graphql'
import type { TinaCloudSchema, TinaTemplate } from '@tinacms/graphql'

export default async function feedback(req, res) {
  const database = await createDatabase({
    bridge: new InMemoryBridge(''),
    store: new LevelStore('', true),
  })
  await indexDB({ database, config, buildSDK: false })
  return graphqlHTTP({
    schema: buildASTSchema(await database.getGraphQLSchema()),
    customExecuteFn: async (args) => {
      const query = print(args.document)

      const result = await resolve({
        database,
        query,
        variables: args.variableValues,
      })
      return result
    },
    graphiql: true,
  })(req, res)
}

export class InMemoryBridge {
  public rootPath: string
  private mockFileSystem: { [filepath: string]: string } | undefined
  constructor(rootPath: string) {
    this.rootPath = rootPath
    this.mockFileSystem = mockFileSystem
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

const mockFileSystem = {
  'content/posts/voteForPedro.json': JSON.stringify({
    title: 'Vote For Pedro',
    category: 'politics',
    author: 'content/authors/napolean.json',
    date: '2022-06-15T07:00:00.000Z',
    body: `
## Hello, world!

This is some text

<Cta heading="Welcome"/>
`,
  }),
  'content/posts/anotherPost.json': JSON.stringify({
    title: 'Just Another Blog Post',
    category: 'lifestyle',
    author: 'content/authors/napolean.json',
    date: '2022-07-15T07:00:00.000Z',
    body: `
## Vote For Pedro

Lorem markdownum evinctus ut cape

`,
  }),
  'content/authors/napolean.json': JSON.stringify({
    name: 'Napolean',
  }),
  'content/pages/turbo.json': JSON.stringify({
    blocks: [
      {
        _template: 'hero',
        headline: 'The All-New Turbo Model',
        tagline: 'Turbo means good',
        text: 'Think fast. Think Turbo.',
      },
      {
        _template: 'features',
        items: [
          {
            title: '10% Faster',
            text: 'Than our slow one',
          },
          {
            title: 'Safer Than Ever',
            text: 'We settled the lawsuits out of court',
          },
        ],
      },
      {
        _template: 'hero',
        headline: 'Our Story',
        text: 'Read about the history of Turbo',
      },
      {
        _template: 'content',
        body: 'Lorem ipsum dolor sit amet',
      },
    ],
  }),
}

const heroBlock: TinaTemplate = {
  name: 'hero',
  label: 'Hero',
  ui: {
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: 'This Big Text is Totally Awesome',
      text: 'Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.',
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Tagline',
      name: 'tagline',
    },
    {
      type: 'string',
      label: 'Headline',
      name: 'headline',
    },
    {
      type: 'string',
      label: 'Text',
      name: 'text',
      ui: {
        component: 'markdown',
      },
    },
  ],
}

const featureBlock: TinaTemplate = {
  name: 'features',
  label: 'Features',
  fields: [
    {
      type: 'object',
      label: 'Feature Items',
      name: 'items',
      list: true,
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Text',
          name: 'text',
        },
      ],
    },
  ],
}

const contentBlock: TinaTemplate = {
  name: 'content',
  label: 'Content',
  ui: {
    defaultItem: {
      body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.',
    },
  },
  fields: [
    {
      type: 'string',
      ui: {
        component: 'markdown',
      },
      label: 'Body',
      name: 'body',
    },
  ],
}

const config: TinaCloudSchema = {
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/posts',
      format: 'json',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Category',
          name: 'category',
        },
        {
          type: 'datetime',
          label: 'Date',
          name: 'date',
        },
        {
          type: 'reference',
          label: 'Author',
          name: 'author',
          collections: ['author'],
        },
        {
          type: 'rich-text',
          label: 'Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'Cta',
              label: 'Call to Action',
              fields: [
                {
                  type: 'string',
                  name: 'heading',
                  label: 'Heading',
                },
              ],
            },
          ],
        },
      ],
      indexes: [
        {
          name: 'category-date',
          fields: [{ name: 'category' }, { name: 'date' }],
        },
      ],
    },
    {
      label: 'Authors',
      name: 'author',
      format: 'json',
      path: 'content/authors',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Avatar',
          name: 'avatar',
        },
      ],
    },
    {
      label: 'Pages',
      name: 'pages',
      format: 'json',
      path: 'content/pages',
      fields: [
        {
          type: 'object',
          list: true,
          name: 'blocks',
          label: 'Sections',
          templates: [heroBlock, featureBlock, contentBlock],
        },
      ],
    },
  ],
}
