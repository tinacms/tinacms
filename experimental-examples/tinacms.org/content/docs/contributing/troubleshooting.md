---
id: /docs/contributing/troubleshooting
title: Contribution Troubleshooting
prev: /docs/contributing/releasing
next: /docs/contributing/style-guide
---

## Troubleshooting in Development

This section contains solutions to various problems you may run into when developing for the TinaCMS.

- [I pulled down changes and now the packages won't build](#I-pulled-down-changes-and-now-my-packages-won't-build)
- [I can't add dependencies to a package](#I-can't-add-dependencies-to-a-package)

### I pulled down changes and now my packages won't build

The links between the local packages may have been broken. If this is the problem, then
running `npm run bootstrap` should fix the issue.

#### Example error message

```
sh: cms-scripts: command not found
```

### I can't add dependencies to a package

Linking prevents running `npm install` from directly inside a package from working. There are two ways to get around this issue.

1. **Add the package with lerna**

   You can use lerna to add new dependencies to a package from the root of the repository:

   ```
   lerna add react --scope @tinacms/react-tinacms
   ```

   The downside of this approach is you can only add one dependency at a time. If you need to add many packages, you can use the next method.

2. **Add dependencies manually, then bootstrap**

   The other approach is to manually add the dependencies to the `package.json` and then run `npm run bootstrap` from the root of the repository.

3. **When I run `npm run bs` it deletes the contents of a package?**

   This sucks. Try running `lerna clean` and then running `npm run bs` again.
