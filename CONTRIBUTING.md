# Contributing to TinaCMS

The following is a set of guidelines and tips for contributing to the TinaCMS and its packages.

## Contributor License Agreement

Before a Pull Request can be accepted, all contributors must sign the [Contributor License Agreement](https://cla-assistant.io/tinacms/tinacms). A GitHub Action runs against all Pull Requests to ensure that **all commit authors** on the associated Pull Request have signed the agreement. The contributor license agreement helps us ensure that the code being contributed was written by the contributor and that we have proper license to use the contribution.

## Development

**Disclaimer**:

- Tina is a new and fast moving project. Although API stability and easy developer experience is important to the core team, they cannot be guaranteed while the project is pre-1.0.
- Although Tina supports many use cases not all of them have helper packages or comprehensive guides. If you’re looking to use Tina in a novel way you will have to do a lot of manual setup.

_Recommended: use the [active LTS version of Node.js](https://nodejs.org/en/about/releases/)_

To get started:

```bash
git clone git@github.com:einstein/tinacms.git
cd tinacms
## Easiest way is to use an existing docker image.
docker run -e 'NODE_OPTIONS=--openssl-legacy-provider' -p 3000:3000 -w /app -v "${PWD}/:/app" -it --rm --name tina-dev node:17 /bin/bash
npm ci --legacy-peer-deps
npm run build

# Start Next.js Demo
cd packages/demo-next
npm run develop
```

To publish package to Einstein's npm

```bash
# navigate back to tinacms root directory
cd ../../
npm login # follow prompts
npm run build
npm run lerna -- publish from-package --yes
```

### Please note

1. Before publishing, Don't forget to bump the version in lerna.json following semantic versioning
2. You may also need to manually go into each package and update intra dependencies' versions
3. Most lerna commands such as bootstrap, etc, will require you to pass `--legacy-peer-deps`

**WARNING: Do not run `npm install` from inside the `packages` directory**

TinaCMS uses [Lerna](https://lerna.js.org/) to manage dependencies when developing locally. This allows the various packages to reference each other via symlinks. Running `npm install` from within a package replaces the symlinks with references to the packages in the npm registry.

### Commands

| Commands                                      | Description                                   |
| --------------------------------------------- | --------------------------------------------- |
| npm run bootstrap                             | Install dependencies and link local packages. |
| npm run build                                 | Build all packages.                           |
| npm run test                                  | Run tests for all packages.                   |
| npm run lerna -- run build --scope \<package> | Build only \<package>.                        |

### Testing With External Projects

Linking apps to a monorepo can be tricky. Tools like `npm link` are buggy and introduce inconsistencies with module resolution. If multiple modules rely on the same package you can easily end up with multiple instances of that package, this is problematic for packages like `react` which expect only one instance.

[`@tinacms/webpack-helpers`](./packages/@tinacms/webpack-helpers) provides tools and instructions for testing local TinaCMS changes on external websites.

### Making Commits

TinaCMS uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) to generate CHANGELOG entries. Please make sure your commits follow this convention.

Please include the package name in the [scope](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#commit-message-with-scope) of your commit. For example:

```
fix(react-tinacms-editor): table row add and delete icons no longer overlap
```

### Creating Packages

Packages in Tina are organized according to their name

| Type      | Naming Convention  | Example Path           |
| --------- | ------------------ | ---------------------- |
| Core Tina | `@tinacms/*`       | `@tinacms/core`        |
| React     | `react-tinacms-*`  | `react-tinacms-remark` |
| Next.js   | `next-tinacms-*`   | `next-tinacms-json`    |
| Gatsby    | `gatsby-tinacms-*` | `gatsby-tinacms-json`  |
| Demos     | `demo-*`           | `demo-gatsby`          |

## Troubleshooting in Development

This section contains solutions to various problems you may run into when developing for TinaCMS.

- [I pulled down changes and now the packages won't build](#I-pulled-down-changes-and-now-my-packages-won't-build)
- [I can't add dependencies to a package](#I-can't-add-dependencies-to-a-package)
- [Run Development Packages ](#Run-Development-Packages)

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
   npm run lerna -- add react --scope react-cms
   ```

   The downside of this approach is you can only add one dependency at a time. If you need to add many packages, you can use the next method.

2. **Add dependencies manually, then bootstrap**

   The other approach is to manually add the dependencies to the `package.json` and then run `npm run bootstrap` from the root of the repository.

3. **When I run `npm run bs` it deletes the contents of a package?**

   This sucks. Try running `npm run lerna -- clean` and then running `npm run bs` again.

### Failed to Compile: Module not found: Can't resolve 'some-tinacms-package'

There are two reasons this error might occur:

1. **The package did not link to `some-tinacms-package`**

   This is likely the problem if `some-tinacms-package` is missing from
   the `node_modules`. If it is, do the following:

   - Make sure `some-tinacms-package` is listed in the `package.json`
   - Run `npm run bootstrap` from the root of the repo.

1. **`some-tinacms-package` was not built.**

   This is likely the problem if: the `build` directory is missing; there are no `.d.ts` or `.js` files. To fix this issue simply run `npm run build` from the root of the repository.

### Run Development Packages

After installing the development setup you can run demo applications contained in the _packages_ directory **demo-cra**, **demo-gatsby** and **demo-next**.

These projects can be used as a development environment for Tina packages, you can edit any other package contained within Tina packages.

When editing the packages of tina we can execute the command `npm run dev` to execute an development build on the repository packages.

This command will build all Tina packages. This will reflect in the references of the tina demo packages, thus updating the demo packages according to the changes made.

This way you can change the tinacms packages and test the changes in the demo packages as a development environment.

## Release Process

TinaCMS packages are updated every Monday.

Checkout the [RELEASE](./RELEASE.md) file for the details.

## RFC Process

See the [tinacms/rfcs](https://github.com/tinacms/rfcs) repo for more info on how new changes are proposed to the tinacms core packages.
