# _tina-grapqhl-gateway_

This monorepo contains the _tina-graphql-gateway_ and _tina-graphql-gateway-cli_ packages, which enable [Tina](https://tina.io)-powered websites to use Tina's hosted Content API.

## Structure

The `apps/` folder contains a demo Next.js application (located in `apps/demo`) that can be used to test changes to the packages in this monorepo.

The `packages/` folder contains the NPM packages that are published from this monorepo.

## Packages

### _tina-graphql-gateway_

Environment: `browser`

Provides React hooks for fetching and building the Tina form. It also exposes a CLI for things like generating Typescript types for your content models.

### _tina-graphql-gateway-cli_

Environment: `node`

Provides `buildSchema` function which takes a `DataSource` instance and provides a schema based on the data it finds.

## How to Run This Project

See the [contributor docs](./CONTRIBUTING.md) for guidance on how to install and run this project.

---

## Using with Tina

To use this with your local Tina repo look in the `demo/next.config.js` file, ensure the paths resolve to your local Tina install and you've built all the necessary Tina packages.

Or take a stab at one of our Tina Cloud starters who are using this package:

- https://github.com/tinacms/tina-cloud-starter (simple starter to demo how to work with our GraphQL Client)
- https://github.com/tinalabs/next-git-starter (based on default Next.js blog starter)

## Managing License Headers

All _.js, _.ts, and \*.tsx files require a license header to be present.

### Add License

To add the license to a file, run the following command at the project root:

```bash
yarn license:add
```

This will search through the project for any files that requires a header and add it if it isn't already present.

### Delete License

To remove all license headers: at the project root run:

```bash
yarn license:delete
```

This will search the project for files that contain a license header and subsequently removes the header from them.

### Update License

When the license needs to be changed, first run the following command at the root of the project:

```bash
yarn license:delete
```

Then you may edit the **scripts/license.txt** file. Once complete, run the following command at the root of the project to add the new license to the required files:

```bash
yarn license:add
```
