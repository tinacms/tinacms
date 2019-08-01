# Forestry CMS

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Getting Started

To get started:

```bash
git clone git@github.com:forestryio/cms.git
cd cms
yarn bootstrap
yarn build

# Start the Gatsby demo
cd packages/demo-gatsby
yarn start
```

## Commands

| Commands                     | Descriptiton                                  |
| ---------------------------- | --------------------------------------------- |
| yarn bootstrap               | Install dependencies and link local packages. |
| yarn build                   | Build all packages                            |
| yarn build --scope <package> | Build only <package>.                         |
| yarn test                    | Run tests for all packages                    |

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

| XEditor Package                         | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `@forestryio/xeditor-react`             | A CMS UI that shows up in a sidebar on your site.               |
| `@forestryio/xeditor-react-fields`      | A collection of Field Plugins for `xeditor`                     |
| `@forestryio/gatsby-plugin-xeditor-cms` | A Gatsby plugin for setting up a `xeditor`                      |
| `@forestryio/gatsby-xeditor-git`        | A `gatsby-xeditor` plugin for saving changes to the local repo. |

### Demo Projects

There are two demo projects:

| Demo Package  | Description                                              |
| ------------- | -------------------------------------------------------- |
| `demo-cra`    | A React application bootstrapped with `create-react-app` |
| `demo-gatsby` | Gatsby starter blog.                                     |

## Contributing

### Troubleshooting in Development

#### I pulled down changes and now my packages won't build

The links between the local packages may have been broken. If this is the problem, then
running `npm run bootstrap` shoudl fix the issue.

## Links

- [Circle CI](https://circleci.com/gh/forestryio/cms): Continuous Integration
