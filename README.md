# Forestry CMS

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Getting Started

- [Documentation](./docs/README.md)
  - [Gatsby Starter](./gatsby/starter-setup.md)
  - [Manual Setup](./gatsby/manual-setup.md)
- [Contributing](./CONTRIBUTING.md)

## Development

To get started:

```bash
git clone git@github.com:forestryio/cms.git
cd cms
npm run bootstrap
npm run build

# Start the Gatsby demo
cd packages/demo/demo-gatsby
npm run start
```

## Commands

| Commands                         | Descriptiton                                  |
| -------------------------------- | --------------------------------------------- |
| npm run bootstrap                | Install dependencies and link local packages. |
| npm run build                    | Build all packages                            |
| npm run build --scope \<package> | Build only \<package>.                        |
| npm run test                     | Run tests for all packages                    |

## Packages

### CMS Toolkit

The core packages are a set of generally used for building CMSs.

| CMS Toolkit Package                  | Description                                                       |
| ------------------------------------ | ----------------------------------------------------------------- |
| `@forestryio/cms`                    | The base package for creating a cms.                              |
| `@forestryio/cms-react`              | A set of hooks and components for using the `cms` in a React app. |
| `@forestryio/cms-final-form-builder` | A `react-final-form` based form builder for creating `cms` forms. |
| `cms-scripts`                        | Contains the script for building `typescript` packages.           |

### XEditor

XEditor is a CMS for React with an emphasis on Gatsby support.

| XEditor Package                     | Description                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| `@forestryio/xeditor`               | A CMS UI that shows up in a sidebar on your site.               |
| `@forestryio/xeditor-fields`        | A collection of Field Plugins for `xeditor`                     |
| `@forestryio/gatsby-plugin-xeditor` | A Gatsby plugin for setting up a `xeditor`                      |
| `@forestryio/gatsby-xeditor-git`    | A `gatsby-xeditor` plugin for saving changes to the local repo. |
| `@forestryio/gatsby-xeditor-json`   | A `gatsby-xeditor` plugin for editing JSON files.               |

### Demo Projects

There are two demo projects:

| Demo Package  | Description                                              |
| ------------- | -------------------------------------------------------- |
| `demo-cra`    | A React application bootstrapped with `create-react-app` |
| `demo-gatsby` | Gatsby starter blog.                                     |

## Links

- [Circle CI](https://circleci.com/gh/forestryio/cms): Continuous Integration
