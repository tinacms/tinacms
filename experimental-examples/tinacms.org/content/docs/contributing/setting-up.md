---
id: /docs/contributing/setting-up
title: Contribution Set-up
prev: /docs/contributing/guidelines
next: /docs/contributing/releasing
consumes:
  - file: /package.json
    details: Uses scripts for local dev
  - file: /lerna.json
    details: Uses the `run` script
  - file: README.md
    details: 'Shows commands, how to get started'
last_edited: '2021-02-18T13:05:33.946Z'
---

## Development

To get started:

```bash
git clone https://github.com/tinacms/tinacms.git
cd tinacms
npm install
npm run bootstrap
npm run build

# Start the Gatsby demo
cd packages/demo-gatsby
npm run start
```

**Do not run** `npm install` from inside the `packages` directory

> **TinaCMS** uses [**Lerna**](https://lerna.js.org/) to manage dependencies when developing locally. This allows the various packages to reference each other via symlinks. Running `npm install` from within a package replaces the symlinks with references to the packages in the npm registry.

## Commands

| Commands                          | Description                                   |
| --------------------------------- | --------------------------------------------- |
| npm run bootstrap                 | Install dependencies and link local packages. |
| npm run build                     | Build all packages                            |
| npm run test                      | Run tests for all packages                    |
| lerna run build --scope <package> | Build only <package>.                         |
| lerna run watch                   | Watch all packages for rebuilds.              |

## Run Development Packages

After installing the development setup you can run demo applications contained in the _packages_ directory **demo-cra**, **demo-gatsby** and **demo-next**.

These projects can be used as a development environment for Tina packages, you can edit any other package contained within Tina packages.

When editing the packages of tina we can execute the command `npm run dev` to execute an development build on the repository packages.

This command will build all Tina packages. This will reflect in the references of the tina demo packages, thus updating the demo packages according to the changes made.

This way you can change the tinacms packages and test the changes in the demo packages as a development environment.
