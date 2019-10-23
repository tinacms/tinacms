# TinaCMS

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Ftinacms%2Ftinacms%2Fbadge&style=flat)](https://actions-badge.atrox.dev/tinacms/tinacms/goto)
[![Slack](https://img.shields.io/badge/slack-tinacms-blue.svg?logo=slack)](https://tinacms.slack.com)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Getting Started

- [Website](https://tinacms.org/)
- [Documentation](https://tinacms.org/docs/)
- [Roadmap](./ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
  - [How to Contribute](./CONTRIBUTING.md#How-to-Contribute)
  - [Creating Packages](./CONTRIBUTING.md#Creating-Packages)
  - [Troubleshooting in Development](./CONTRIBUTING.md#Troubleshooting-in-Development)
  - [Releasing](./CONTRIBUTING.md#Releasing)

[![Tina Demo](https://res.cloudinary.com/forestry-demo/video/upload/du_16,w_700,e_loop/v1571159974/tina-hero-demo.gif)](https://tinacms.org/)

## Development

To get started:

```bash
git clone git@github.com:tinacms/tinacms.git
cd tinacms
npm install && npm run bootstrap
npm run build

# Start Gatsby demo
cd packages/demo-gatsby
npm run start
```

**Do not run `npm install` from inside the `packages` directory**

TinaCMS uses [Lerna](https://lerna.js.org/) to manage dependencies when developing locally. This allows the various packages to reference each other via symlinks. Running `npm install` from within a package replaces the symlinks with references to the packages in the npm registry.

### Commands

| Commands                           | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| npm run bootstrap                  | Install dependencies and link local packages. |
| npm run build                      | Build all packages.                           |
| npm run watch                      | Watch all packages for rebuilds.              |
| npm run test                       | Run tests for all packages.                   |
| lerna run build --scope \<package> | Build only \<package>.                        |

## Release Process

Tina has three main branches:

- **master:** The bleeding edge of tinacms
- **next:** A preview of the next release
- **latest:** The current stable release

The flow of changes therefore looks like:

> `fix-some-bug` => `master` => `next` => `latest`

This flow happens over a 2 week release process:

- Day 1: A new `next` branch is created from `master`.
- Week 1: `next` is kept up to date with `master` with frequent pre-releases
- Week 2: `next` is frozen for new development but critical bug fixes can be cherry picked.
- Day 14: `next` is released to npm, and then merged into `latest`
