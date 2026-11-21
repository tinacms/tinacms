# @tinacms/mcp

An [MCP](https://modelcontextprotocol.io) server that lets an AI assistant list collections and read, create and update documents in a TinaCMS project through its GraphQL API. It validates writes against the project's schema, so an invalid change returns an error and writes nothing.

## Usage

Start your project with `tinacms dev`, then add the server to your MCP client's configuration:

```json
{
  "mcpServers": {
    "tinacms": {
      "command": "npx",
      "args": ["@tinacms/mcp"]
    }
  }
}
```

By default it connects to `http://localhost:4001/graphql`.

| Option          | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| `--url <url>`   | GraphQL endpoint. Default `http://localhost:4001/graphql`.            |
| `--token <key>` | TinaCloud token, sent as `X-API-KEY`. Can also be set as `TINA_TOKEN`. |
| `--read-only`   | Do not expose the tools that create or change documents.              |

Writes are only enabled for a local endpoint (`localhost`, `127.0.0.1`, `::1`). A remote endpoint, such as TinaCloud, is always read-only.

## Tools

| Tool               | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `list_collections` | Collections with their fields and templates.                                         |
| `list_documents`   | Documents in a collection, paginated with `first` and `after`.                       |
| `get_document`     | One document's field values.                                                         |
| `create_document`  | Create a document. Pass `template` for collections that define templates.            |
| `update_document`  | Change some fields of a document; the fields you leave out keep their current value. |

`create_document` and `update_document` are not registered in read-only mode.

## Development

```bash
pnpm --filter @tinacms/mcp test
```

The tests run the server against a real TinaCMS database over a temporary content folder, so they cover the GraphQL schema Tina generates, not a mock of it.
