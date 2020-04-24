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

i.e. `yarn add tinacms@next`

### Script

```sh
scripts/prerelease.sh
```

### Manual

1. **Checkout Master**

   ```
   git checkout master
   ```

1. **Build the source files:**

   ```
   npm run hard-reset
   ```

1. **Generate CHANGELOGs and git tags:**

   ```
   lerna version \
     --conventional-commits \
     --conventional-prerelease \
     --no-push \
     --allow-branch master \
     -m "chore(publish): prerelease" \
     --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json'
   ```

1. **Publish to NPM:**

   ```
   lerna publish from-package --dist-tag next
   ```

1. **Push CHANGELOGs and git tags to GitHub:**

   ```
   git push && git push --tags
   ```

## Release

i.e `yarn add tinacms` or `yarn add tinacms@latest`

1. **Merge Changes**

   ```
   git checkout latest
   git merge master
   git push
   ```

1. **Build the source files:**

   ```
   npm run hard-reset
   ```

1. **Generate CHANGELOGs and git tags:**

   ```
   lerna version \
     --conventional-commits \
     --conventional-graduate \
     --no-push \
     --allow-branch latest \
     -m "chore(publish): latest" \
     --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json'
   ```

1) **Publish to NPM:**

   ```
   lerna publish from-package
   ```

1) **Push CHANGELOGs and git tags to Github:**
   ```
   git push && git push --tags
   ```

1. **Backmerge to `master`**

   ```
   git checkout master
   git merge latest
   git push
   ```

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
