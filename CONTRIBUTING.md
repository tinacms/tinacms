# Contributing to Forestryio CMS

The following is a set of guidelines and tips for contributingto the Forestryio CMS and its packages.

## How to Contribute

- **Reporting Bugs**
- **Suggesting Enhancements**
- **Writing Docs, Guides, or Blog Posts**
- **Voluntering for User Testing**

## Naming Packages

- `@tinacms/*`: Internal packages
- `@tinacms/api-*`: Node API extensions
- `react-tinacms-*`: React specific packages
- `vue-tinacms-*`: Vue specific packages
- `gatsby-tinacms-*`: Gastby plugins

## Troubleshooting

This section contains solutions to various problems you may run into when developing for the Forestryio CMS.

- [I pulled down changes and now the packages won't build](#I-pulled-down-changes-and-now-my-packages-won't-build)
- [I can't add dependencies to a package](#I-can't-add-dependencies-to-a-package)

### I pulled down changes and now my packages won't build

The links between the local packages may have been broken. If this is the problem, then
running `npm run bootstrap` shoudl fix the issue.

### I can't add dependencies to a package

Linking prevents running `npm install` from directly inside a package from working. There are two ways to get around this issue.

1. **Add the package with lerna**

   You can use lerna to add new dependencies to a package from the root of the repository:

   ```
   lerna add react --scope @forestryio/react-cms
   ```

   The downside of this approach is you can only add one dependency at a time. If you need to add many packages, you can use the next method.

2. **Add dependencies manually, then bootstrap**

   The other approach is to manually add the dependencies to the `package.json` and then run `npm run bootstrap` from the root of the repository.

3. **When I run `npm run bs` it deletes the contents of a package?**

   This sucks. Try running `lerna clean` and then running `npm run bs` again.
