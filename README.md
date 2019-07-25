# Forestry CMS

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Packages

| Package                  | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `cms`                    | The base package for creating a cms.                         |
| `cms-final-form-builder` | A React based form builder for `cms` that uses `final-form`. |
| `cms-scripts`            | Contains the script for building `typescript` packages.      |
| `gatsby-plugin-cms`      | A Gatsby plugin for connecting to `cms`.                     |

## Contributing

To get started:

```bash
git clone git@github.com:forestryio/cms.git
cd cms
yarn bootstrap
yarn build

# Start the Gatsby demo
cd packages/gatsby-demo
yarn start
```

### Commands

| Commands                     | Descriptiton                                  |
| ---------------------------- | --------------------------------------------- |
| yarn bootstrap               | Install dependencies and link local packages. |
| yarn build                   | Build all packages                            |
| yarn build --scope <package> | Build only <package>.                         |
| yarn test                    | Run tests for all packages                    |

### Demo Projects

There are two demo projects:

- `packages/cra-demo`
- `packages/gatsby-demo`
