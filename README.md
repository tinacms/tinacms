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

The process happens over a week:

- On Monday
  1. `next` is merged into `latest`; then `latest` is published to npm
  2. `master` is merged into `next`; then `next` is published to npm
- Any hot fixes for bugs will be cherry picked into `next` and `latest`
  and the published accordingly.
- Every pull request merged to `master` automatically triggers a
  `canary` release.

With this process:

- all accepted changes are available as `canary` releases for early testing
- critical fixes are published as soon as possible
- new features and minor fixes take ~1.5 weeks to be published
