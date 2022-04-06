---
title: Running the Local GraphQL API
next: '/docs/graphql/queries'
---

The _TinaCMS CLI_ can be used to set up your project with a TinaCMS schema configuration, and run a local version of the TinaCMS GraphQL API (using your filesystem's content). For a real-world example of how this is being used checkout the [Tina Cloud Starter](https://github.com/tinacms/tina-cloud-starter).

## Installation

The `@tinacms/cli` package will be installed as a dev dependency with the [tina init](/docs/setup-overview/#manual-setup-on-an-existing-site) command.

```bash,copy
npx @tinacms/cli init
```

This will setup a dummy `.tina/schema.ts` in your site, and install any required Tina dependencies.

## Running the GraphQL API

`schema:start` will compile the schema into static files, generate typescript types for you to use in your project, and start a graphQL server on http://localhost:4001

This command also takes an argument (`-c`) that allows you to run a command as a child process. This is very helpful for running a dev server and building your next.js app. The scripts portion of your package.json should look like this.

```json,copy
"scripts": {
  "dev": "yarn tinacms server:start -c \"next dev\"",
  "build": "yarn tinacms server:start -c \"next build\"",
  "start": "yarn tinacms server:start -c \"next start\"",
  ...
},
```

The reason we want to run the GraphQL API with our site is so that:

- When our static pages build in CI, they can source their content from the local files using the GraphQL API.
- In development, we can test out Tina with our local files.

Now if you run the updated `dev` script with:

```bash,copy
npm run dev
```

or

```bash,copy
yarn dev
```

Your live site will run, but so will a local version of the GraphQL Content API.

Your console might show something like:

```sh
> yarn tina-dev

Started Filesystem GraphQL server on port: 4001
Visit the playground at http://localhost:4001/altair/
Generating Tina config
...
```

Once the graphql server is running, you can start to explore your graphQL content through the Altair client at `http://localhost:4001/altair/`

![Altair client](/gif/altair_doc.gif)
