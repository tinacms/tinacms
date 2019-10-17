# TinaCMS

[![Slack](https://img.shields.io/badge/slack-tinacms-blue.svg?logo=slack)](https://tinacms.slack.com)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

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

# Start the Gatsby demo
cd packages/demo-gatsby
npm install && npm run start
```

> **TinaCMS** uses [**Lerna**](https://lerna.js.org/) to manage dependencies when developing locally. This allows the various packages to reference each other via symlinks. Running `npm install` from within a package replaces the symlinks with references to the packages in the npm registry.

### Commands

| Commands                           | Descriptiton                                  |
| ---------------------------------- | --------------------------------------------- |
| npm run bootstrap                  | Install dependencies and link local packages. |
| npm run build                      | Build all packages                            |
| npm run watch                      | Watch all packages for rebuilds.              |
| npm run test                       | Run tests for all packages                    |
| lerna run build --scope \<package> | Build only \<package>.                        |
