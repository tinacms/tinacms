## PR Workflow

#### Make changes to code and commit them.

#### Before you push a PR, add a changeset. Ensure you don't have any staged changes before doing this

```sh
# from the root of the repo
yarn changeset
```

Choose the package or packages that were affected by your work. _(Tip: you may have to wait a couple of seconds after selecting your packages, sometimes it doesn't get registered and it'll ask you to pick again)_

> Note: You do not need to select packages which _depend_ on changes you made in other packages, the release process will do this automatically for you later on. Just choose packages you worked on directly.

![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-1.png)

Choose the _type_ of version change they should get. Skipping `major` will ask you if you want to select `minor`, if you skip that it will assume `patch`.

![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-2.png)

Proceed through the prompts until you havee a new `.md` file in the `.changeset` directory. It'll look [like this](https://github.com/tinacms/tina-graphql-gateway/blob/348ef1e57e2e61fb9896d616aabc6f3c85d37140/.changeset/pretty-sloths-return.md)

![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-3.png)
![](https://github.com/tinacms/tina-graphql-gateway/blob/main/meta/yarn-changeset-4.png)

Feel free to edit this file if you want to alter your messages or which versions will be bumped.

#### Commit your changes and push to Github and creat a PR

The PR will be checked for a changeset file. You're done!

Once the PR is merged and has completed it's actions, you can install the changes by installing the @dev version of the package. So if there were changes to `tina-graphql` merged into `main`, you can test them out by running `yarn add tina-grahql@beta`.

However, your changes won't yet be published to NPM under the `@latest` tag yet. So without specifying the `@beta` tag, users won't get your latest changes. Instead, when the PR is merged to `main`, another action will kick in. It will create a _separate_ PR which is essentially all of the active changesets in flight. So several merged PRs may result in several pending changesets.

This PR calls `yarn changeset version`, which _deletes_ changeset files and updates `CHANGELOG.md` files in each package. This PR will stay up to date as new changesets enter the `main` branch. [Here's an example](https://github.com/tinacms/tina-graphql-gateway/pull/316) of what that looks like. Only once this PR is merged will the latest changes be generally available.

#### For maintainers: Merge the "Version Packages" PR _back_ to `main`

Previous PRs to main would _not_ have triggered NPM packages to be published because their `versions` haven't been bumped. That's the purpose of the "Version Package" action. So these merges will now have updated `versions`, resulting in publishes to NPM.

## Creating a dev release

Ensure you have created a changeset and have a clean `git` working directory.

Build your changes with `yarn build`

Run `yarn changeset version --snapshot`

Run `yarn ci:publish-dev`

If you have 2FA, this will prompt you to enter you one-time code for each package you publish.

Run `git co -- .` This will clear out the versioning changes
