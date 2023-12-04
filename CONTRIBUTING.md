# Contributing to TinaCMS

The following is a set of guidelines and tips for contributing to the TinaCMS and its packages.

## Contributor License Agreement

Before a Pull Request can be accepted, all contributors must sign the [Contributor License Agreement](https://cla-assistant.io/tinacms/tinacms). A GitHub Action runs against all Pull Requests to ensure that **all commit authors** on the associated Pull Request have signed the agreement. The contributor license agreement helps us ensure that the code being contributed was written by the contributor and that we have proper license to use the contribution.

## Getting started

Currently this is a monorepo built with Turborepo and PNPM

You _should_ :fingers_crossed: be able to just run these commands. (Please make a note of any hang-ups you ran into during this process and feel free to update this doc with any tips you have for others.)

> Having issues? Feel free to reach out on [Discord](https://discord.com/invite/zumN63Ybpf)

```sh
# check the node version, 18 or greater is required
node -v
# you can use nvm (https://github.com/nvm-sh/nvm) to switch version
# install pnpm (see docs for other options https://pnpm.io/installation)
# We are currently using pnpm@7
npm install -g pnpm@7.32.4
# ensure you have the correct version (7.32.4)
pnpm -v
# some packages rely on yarn, so you may need to install that too
npm install -g yarn
# install dependencies
pnpm install
# build all the packages
pnpm run build
# watch all packages
pnpm run watch
# in a separate tab, navigate to starter project
cd examples/basic-iframe
# start the dev server
pnpm run dev
```

Now you should be able to navigate to http://localhost:3000 and see the starter project.

## PR Workflow

All pull requests should include a changeset. To create a changeset, ensure you don't have any uncommitted changes and then run the following command:

```sh
# from the root of the repo
pnpm changeset
```

Choose the package or packages that were affected by your work. _(Tip: you may have to wait a couple of seconds after selecting your packages, sometimes it doesn't get registered and it'll ask you to pick again)_

> Note: You do not need to select packages which _depend_ on changes you made in other packages, the release process will do this automatically for you later on. Just choose packages you worked on directly.

![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-1.png)

Choose the _type_ of version change they should get. Skipping `major` will ask you if you want to select `minor`, if you skip that it will assume `patch`.

> Note: If you're not sure what to choose, `patch` is usually a safe bet.

![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-2.png)

Proceed through the prompts until you have a new `.md` file in the `.changeset` directory. It'll look [like this](https://github.com/tinacms/tina-graphql-gateway/blob/348ef1e57e2e61fb9896d616aabc6f3c85d37140/.changeset/pretty-sloths-return.md)

![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-3.png)
![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-4.png)

Feel free to edit this file if you want to alter your messages or which versions will be bumped.

### Commit your changes and push to GitHub and create a PR

The PR will be checked for a changeset file. You're done!

Once the PR is merged and has completed it's actions, you can install the changes by installing the @dev version of the package. So if there were changes to `@tinacms/graphql` merged into `main`, you can test them out by running `pnpm add @tinacms/graphql@beta`.

However, your changes won't yet be published to NPM under the `@latest` tag yet. So without specifying the `@beta` tag, users won't get your latest changes. Instead, when the PR is merged to `main`, another action will kick in. It will create a _separate_ PR which is essentially all of the active changesets in flight. So several merged PRs may result in several pending changesets.

This PR calls `pnpm changeset version`, which _deletes_ changeset files and updates `CHANGELOG.md` files in each package. This PR will stay up to date as new changesets enter the `main` branch. [Here's an example](https://github.com/tinacms/tina-graphql-gateway/pull/316) of what that looks like. Only once this PR is merged will the latest changes be generally available.

### For maintainers: Merge the "Version Packages" PR _back_ to `main`

Previous PRs to main would _not_ have triggered NPM packages to be published because their `versions` haven't been bumped. That's the purpose of the "Version Package" action. So these merges will now have updated `versions`, resulting in publishes to NPM.

## Creating a dev release (core team only)

Ensure you have created a changeset and have a clean `git` working directory.

Build your changes with `pnpm build`

Run `pnpm version:snapshot`

Run `pnpm publish:dev`

If you have 2FA, this will prompt you to enter you one-time code for each package you publish.

Run `git checkout -- .` This will clear out the versioning changes.

---

## Trying out changes to a package

### Local

If the changes affect local use of the packages (i.e. not the ContentAPI), use the tina-cloud-starter found in the examples directory of this repo.

## E2E tests

In order to run the Cypress E2E tests:

1. Build and start the E2E test project
   ```sh
   NEXT_PUBLIC_USE_LOCAL_CLIENT=1
   pnpm build:e2e
   pnpm start:e2e
   ```
2. Run the tests in a separate terminal `pnpm test:dev` or `pnpm test:e2e`
