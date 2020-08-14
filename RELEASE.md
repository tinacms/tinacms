# Creating Releases

Tina has two main branches:

- **master:** The bleeding edge of tinacms
- **latest:** The current stable release

The flow of changes therefore looks like:

> `fix-some-bug` => `master` => `latest`

This is a weekly process:

- On Monday `master` is merged into `latest` which is then published to npm.
- Hot fixes are cherry picked onto `latest` and then published.
- Prereleases are created off of `master` whenever they're needed.

With this process:

- critical fixes are published as soon as possible
- new features and minor fixes take 3-5 days to be published

## Prerelease

> i.e. `yarn add tinacms@next`

From the terminal run:

```sh
scripts/prerelease.sh
```

View it's [source](./scripts/prerelease.sh) if you want to run the steps manually.


## Release

> i.e. `yarn add tinacms`

From the terminal run:

```sh
scripts/release.sh
```

View it's [source](./scripts/release.sh) if you want to run the steps manually.

## Listing Contributors

To generate a list of contributors

Command:

```
git shortlog tinacms@PREV..tinacms@LATEST -sn --no-merges
```

Example Output:

```
4  Nolan Phillips
2  Thomas Weibenfalk
1  Scott Byrne
```
