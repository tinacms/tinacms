| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

| Syntax      | Description | Score |
| ----------- | ----------- | ----------- |
| Header      | Title       | Some **bold** and *emphasized* text |
| Paragraph   | Text        | Some `inline` code examples|

| Syntax      | Description | Score                               | Description
| ----------- | ----------- | ----------------------------------- | -----------
| Header      | Title       | Some **bold** and *emphasized* text | Title
| Paragraph   | Text        | Some `inline` code examples         | Text

---
title: The TinaCMS CLI
---

## Available Commands

```sh
> yarn run tinacms

Usage: @tinacms/cli command [options]

Options:
  -v, --version    output the version number
  -h, --help       display help for command

Commands:
  dev [options]    Start Filesystem Graphql Server
  build [options]  Build Tina
  init [options]   Add Tina Cloud to an existing project
  audit [options]  Audit your schema and the files to check for errors
  help [command]   display help for command

You can get help on any command with "-h" or "--help".
e.g: "tinacms dev --help"
```

## Basic Usage:

### `tinacms dev`

> To run this command, you must have a valid `tina/config.{ts,tsx,js,jsx}` file.

`dev` will compile the schema into static files, generate typescript types for use in your project and start a graphQL server on http://localhost:4001

This command takes the following arguments:

| Argument         | Description                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`             | `-c` allows you to optionally run a command as a child process. For example, you could run your Next.js project alongside the graphQL server `yarn tinacms dev -c next dev`. |
| `--port <port>`  | Specify a port to run the server on. (default 4001)                                                                                                                          |
| `--noWatch`      | Don't regenerate config on file changes. This option is good to add when building in CI or if you do not want to watch the file system for changes.                          |
| `--noSDK`        | Don't generate the generated client SDK. [Read here](/docs/graphql/client/) for more details about the SDK.                                                                  |
| `-v`,`--verbose` | increase verbosity of logged output (default: false)                                                                                                                         |

### `tinacms build`

This command compiles and validates the schema and generates the client and types. It will also ensure your content has finished indexing.

| Argument                 | Description                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `--noTelemetry`          | Disables Open Source Telemetry                                                                              |
| `--noSDK`                | Don't generate the generated client SDK. [Read here](/docs/graphql/client/) for more details about the SDK. |
| `-v`,`--verbose`         | increase verbosity of logged output (default: false)                                                        |
| `--tina-graphql-version` | Specify the version of `@tinacms/graphql` that the backend will use. (Only needed in advanced cases)        |

### `npx @tinacms/cli@latest init`

> The init command must be run inside of an existing project (E.g a NextJS project, Hugo, Jekyll, etc).

```bash,copy
npx @tinacms/cli init
```

This will,

1. Install all required dependencies for Tina.
2. Define a basic content schema in the `.tina` directory.
3. Create example content in the demo directory.
4. Edit the `package.json` to have the `dev`, `build`, and `start` scripts run the tina GraphQL API.

#### Optional parameters

| Argument        | Description                    |
| --------------- | ------------------------------ |
| `--noTelemetry` | Disables Open Source Telemetry |

### `tinacms audit`

`audit` is used for checking for errors in your in your files. It currently does two things.

1. Checks to see if the files have the correct extension
2. Submits each file as a Graphql mutation and checks for Graphql errors

By default the mutation will not change the content of the files.

Takes the following options,

| Argument         | Description                                                                                                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--clean`        | When this flag is used, it submits actual Graphql mutations to the file system. This means that it will clean out any fields that are not defined in your schema. It is a good practice to do a `git commit` before doing this so unintended changes can be easily undone. |
| `-v`,`--verbose` | increase verbosity of logged output (default: false)                                                                                                                                                                                                               |
