# Contributing to TinaCMS

The following is a set of guidelines and tips for contributing to the TinaCMS and its packages.

## How to Contribute

- **Reporting Bugs**
- **Suggesting Enhancements**
- **Writing Docs, Guides, or Blog Posts**
- **Volunteering for User Testing**

## Contributing Code

### Making Commits

TinaCMS uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) to generate CHANGELOG entries. Please make sure your commits follow this convention.

### Creating Packages

Packages in Tina are organized according to thier name

| Type                    | Naming Convention  | Example Path           |
| ----------------------- | ------------------ | ---------------------- |
| Internal packages       | `@tinacms/*`       | `@tinacms/core`        |
| Node API extensions     | `@tinacms/api-*`   | `@tinacms/api-git`     |
| React specific packages | `react-tinacms-*`  | `react-tinacms-remark` |
| Gastby plugins          | `gatsby-tinacms-*` | `gatsby-tinacms-json`  |
| Next.js helpers         | `next-tinacms-*`   | `next-tinacms-json`    |
| Demo Projects           | `demo-*`           | `demo-gatsby`          |

## Troubleshooting in Development

This section contains solutions to various problems you may run into when developing for the TinaCMS.

- [I pulled down changes and now the packages won't build](#I-pulled-down-changes-and-now-my-packages-won't-build)
- [I can't add dependencies to a package](#I-can't-add-dependencies-to-a-package)

### I pulled down changes and now my packages won't build

The links between the local packages may have been broken. If this is the problem, then
running `npm run bootstrap` should fix the issue.

#### Example error message

```
sh: tinacms-scripts: command not found
```

### I can't add dependencies to a package

Linking prevents running `npm install` from directly inside a package from working. There are two ways to get around this issue.

1. **Add the package with lerna**

   You can use lerna to add new dependencies to a package from the root of the repository:

   ```
   lerna add react --scope react-cms
   ```

   The downside of this approach is you can only add one dependency at a time. If you need to add many packages, you can use the next method.

2. **Add dependencies manually, then bootstrap**

   The other approach is to manually add the dependencies to the `package.json` and then run `npm run bootstrap` from the root of the repository.

3. **When I run `npm run bs` it deletes the contents of a package?**

   This sucks. Try running `lerna clean` and then running `npm run bs` again.

## Release Process

The TinaCMS core team releases frequently. Checkout the [RELEASE.md](./RELEASE.md) file to see how to create a release.
