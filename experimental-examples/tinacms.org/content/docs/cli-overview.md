---
title: The TinaCMS CLI
---

## Available Commands

```sh
> yarn run tinacms

Usage: @tinacms/cli command [options]

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  server:start [options]    Start Filesystem Graphql Server
  schema:compile [options]  Compile schema into static files for the server
  schema:types [options]    Generate a GraphQL query for your site's schema, (and optionally Typescript types)
  init [options]            Add Tina Cloud to an existing project
  audit [options]           Audit your schema and the files to check for errors
  help [command]            display help for command
```

## Basic Usage:

### init

> The init command must be run inside of a Next.js project

```bash,copy
npx @tinacms/cli init
```

This will,

1. Install all required dependencies for Tina.
2. Define a basic content schema in the `.tina` directory.
3. Add some Tina boilerplate components.
4. Create example content in the demo directory.
5. Edit the `package.json` to have the `dev`, `build`, and `start` scripts run the tina GraphQL API.

### `tinacms server:start`

> To run this command, you must have a valid `.tina/schema.ts` file.

`server:start` will compile the schema into static files, generates typescript types for you to use in your project and starts a graphQL server on http://localhost:4001

This command also takes the following arguments

| Argument        | Description                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`            | `-c` allows you to run a command as a child process. For example, you could run your next project alongside the graphQL server `yarn tinacms server:start -c next dev`. |
| `--port <port>` | Specify a port to run the server on. (default 4001)                                                                                                                     |
| `--noWatch`     | Don't regenerate config on file changes. This option is good to add when building in CI or if you do not want to watch the file system for changes.                     |
| `--noSDK`       | Don't generate the generated client SDK. [Read here](/docs/graphql/client/) for more details about the SDK                                                              |

## Advanced Usage:

### `tinacms schema:compile`

`schema:compile` is used to compile and transpile the schema files into static file(s) ready to be used with the server. The compilation can be found in the `.tina/__generated__/config` directory.

### `tinacms schema:types`

`schema:types` will generate a GraphQL query for your site's schema and typescript files. You will find the generated files in the `.tina/__generated__/` directory.

### `tinacms audit` (Experimental)

`audit` is used for checking for errors in your in your files. It currently does two things.

1. Checks to see if the files have the correct extension
2. Submits each file as a Graphql mutation and checks for Graphql errors

By default the mutation will not change the content of the files.

Takes the following options,

| Argument  | Description                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--clean` | When this flag is used, it really submits the Graphql mutations to the file system. This means that it will clean out any fields that are not defined in your `schema.ts`. It is a good practice to do a `git commit` before doing this so one can undo changes easily. |
