# @tinacms/graphql

[Tina](https://tina.io) is a headless content management system with support for Markdown, MDX, JSON, YAML, and more. This package contains the logic required to turn a collection of folders and files into a database that can be queried using [GraphQL](https://tina.io/docs/graphql/queries).

## Features

- Query Markdown, MDX, JSON, YAML and more using GraphQL
- Supports references between documents
- Pre-generation of schema and query data to expedite website compilation

## Getting Started

The easiest way to use this package is as part of a broader TinaCMS site. The starter can be tested locally using:

```
npx create-tina-app@latest
```

Alternatively, you can directly install and use this package.

### Install @tinacms/graphql

```
pnpm install
pnpm add @tinacms/graphql
```

### Build your program

The following example demonstrates how to use this package.

```ts
import { MemoryLevel } from 'memory-level';
import {
  Database,
  FilesystemBridge,
  buildSchema,
  resolve
} from '@tinacms/graphql';
import {
  Schema
} from '@tinacms/schema-tools';

const dir = 'content';

// Where to source content from
const bridge = new FilesystemBridge(dir);
// Where to store the index data
const indexStorage = new MemoryLevel<string, Record<string, string>>();

// Create the schema/structure of the database
const rawSchema: Schema = {
  collections: [
    {
      name: 'post',
      path: '', // Don't require content to be placed within a subdirectory
      fields: [
        {
          type: 'string',
          name: 'title',
          isTitle: true,
          required: true
        }
      ]
    }
  ]
};
const schema = await buildSchema({
  schema: rawSchema,
  build: {
    publicFolder: '',
    outputFolder: ''
  }
});

// Create the object for editing and querying your repository
const database = new Database({
  bridge,
  level: indexStorage,
  tinaDirectory: 'tina'
});

// Generate the index data required to support querying
await database.indexContent(schema)

// Query the database and output the result
// In this case, it will retrieve the title of the post 'in.md'
const graphQLQuery = `
query {
  document(collection: "post", relativePath: "in.md") {
    ...on Document {
      _values,
      _sys { title }
    }
  }
}
`
const result = await resolve({
  database,
  query: graphQLQuery,
  variables: {}
});

// Output the result
console.log(JSON.stringify(result))
```

For the program to work:

1. Install packages:
    - [`@tinacms/schema-tools`](https://www.npmjs.com/package/@tinacms/schema-tools) 
    - [`memory-level`](https://www.npmjs.com/package/memory-level)
2. Add a file `content/in.md` of the following form:

```md
---
title: Hello
---
```

The output should be:

```json
{"data":{"document":{"_values":{"_collection":"post","_template":"post","title":"Hello"},"_sys":{"title":"Hello"}}}}
```

## Development

The package is part of the [TinaCMS repository](https://github.com/tinacms/tinacms/).

## Documentation

Visit [Tina's documentation](https://tina.io/docs/) to learn more.

## Questions?

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Ftinacms.org&text=I%20just%20checked%20out%20@tinacms%20on%20GitHub%20and%20it%20is%20sweet%21&hashtags=TinaCMS%2Cjamstack%2Cheadlesscms)
[![Forum](https://shields.io/github/discussions/tinacms/tinacms)](https://github.com/tinacms/tinacms/discussions)

Visit the [GitHub Discussions](https://github.com/tinacms/tinacms/discussions) or our [Community Discord](https://discord.com/invite/zumN63Ybpf) to ask questions, or look us up on on Twitter at [@tinacms](https://twitter.com/tinacms).

## Contributing

Please see our [./CONTRIBUTING.md](https://github.com/tinacms/tinacms/blob/main/CONTRIBUTING.md)
