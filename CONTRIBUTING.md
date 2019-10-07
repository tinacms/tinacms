# Contributing to TinaCMS

The following is a set of guidelines and tips for contributingto the TinaCMS and its packages.

## How to Contribute

- **Reporting Bugs**
- **Suggesting Enhancements**
- **Writing Docs, Guides, or Blog Posts**
- **Voluntering for User Testing**

## Contributing Code

### Making Commits

TinaCMS uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) to generate CHANGELOG entries. Please make sure your commits follow this convention.

### Creating Packages

| Type                    | Folder   | Naming Convention  |
| ----------------------- | -------- | ------------------ |
| Internal packages       | `core`   | `@tinacms/*`       |
| Node API extensions     | `api`    | `@tinacms/api-*`   |
| React specific packages | `react`  | `react-tinacms-*`  |
| Vue specific packages   | `vue`    | `vue-tinacms-*`    |
| Gastby plugins          | `gatsby` | `gatsby-tinacms-*` |
| NextJS package          | `next`   | `next-tinacms-*`   |
| Demo Projects           | `demo`   | `demo-*`           |

## Troubleshooting in Development

This section contains solutions to various problems you may run into when developing for the TinaCMS.

- [I pulled down changes and now the packages won't build](#I-pulled-down-changes-and-now-my-packages-won't-build)
- [I can't add dependencies to a package](#I-can't-add-dependencies-to-a-package)

### I pulled down changes and now my packages won't build

The links between the local packages may have been broken. If this is the problem, then
running `npm run bootstrap` shoudl fix the issue.

#### Example error message

```
sh: cms-scripts: command not found
```

### I can't add dependencies to a package

Linking prevents running `npm install` from directly inside a package from working. There are two ways to get around this issue.

1. **Add the package with lerna**

   You can use lerna to add new dependencies to a package from the root of the repository:

   ```
   lerna add react --scope @tinacms/react-cms
   ```

   The downside of this approach is you can only add one dependency at a time. If you need to add many packages, you can use the next method.

2. **Add dependencies manually, then bootstrap**

   The other approach is to manually add the dependencies to the `package.json` and then run `npm run bootstrap` from the root of the repository.

3. **When I run `npm run bs` it deletes the contents of a package?**

   This sucks. Try running `lerna clean` and then running `npm run bs` again.

## Releasing

### Prerelease

1. **Build the source files:**

   ```
   npm run build
   ```

1. **Generate CHANGELOGs and git tags:**
   ```
   lerna version \
     --conventional-commits \
     --conventional-prerelease \
     --no-push \
     --allow-branch master \
     -m "chore(publish): prerelease"
   ```
1. **Publish to NPM:**
   ```
   lerna publish from-git --dist-tag next
   ```
1. **Push CHANGELOGs and git tags to Github:**
   ```
   git push
   ```

### Graduating Prereleases

1. **Build the source files:**

   ```
   npm run build
   ```

1. **Generate CHANGELOGs and git tags:**
   ```
   lerna version \
     --conventional-commits \
     --conventional-graduate \
     --no-push \
     --allow-branch master \
     -m "chore(publish): graduation"
   ```
1. **Publish to NPM:**
   ```
   lerna publish from-git
   ```
1. **Push CHANGELOGs and git tags to Github:**
   ```
   git push
   ```
