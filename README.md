# Forestry CMS

## Contributing

To get started:

```
git clone git@github.com:forestryio/cms.git
cd cms
yarn bootstrap
yarn build -p cms

# Start the Gatsby demo
cd packages/gatsby-demo
yarn start
```

### Commands

| Commands                | Descriptiton                                  |
| ----------------------- | --------------------------------------------- |
| yarn bootstrap          | Install dependencies and link local packages. |
| yarn build              | Build all packages                            |
| yarn build -p <package> | Build just <package> repo.                    |
| yarn test               | Run tests for all packages                    |

### Demo Projects

There are two demo projects:

- packages/cra-demo
- packages/gatsby-demo
