# Releasing

## Release Process

Tina has three main branches:

- **master:** The bleeding edge of tinacms
- **latest:** The current release

The flow of changes therefore looks like:

> `fix-some-bug` => `master` => `latest`

The process looks like this:

- On Monday `master` is merged into `latest`; then `latest` is published to npm
- Any hot fixes for bugs will be cherry picked into `latest`
  and the published accordingly.
- Every pull request merged to `master` automatically triggers a
  `canary` release.

With this process:

- all accepted changes are available as `canary` releases for early testing
- critical fixes are published as soon as possible
- new features and minor fixes take half a week (on average) to be published

## Creating Releases

### Canary

Canary release are automatically created when commits are pushed to `master`.

<!--COMMENT THIS OUT FOR NOW. WE WANT A FASTER CYCLE

### Prerelease

i.e. `yarn add tinacms@next`

1. **Merge Changes**

   ```
   git checkout next
   git merge master
   git push
   ```

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
     --allow-branch next \
     -m "chore(publish): prerelease"
   ```

1. **Clean the CHANGELOGs**

   ```
   lcc ** && git commit -am "chore: clean changelogs"
   ```

1. **Publish to NPM:**

   ```
   lerna publish from-package --dist-tag next
   ```

1. **Push CHANGELOGs and git tags to Github:**

   ```
   git push && git push --tags
   ```

1. **Backmerge to `master`**

   ```
   git checkout master
   git merge next
   git push
   ```
-->

### Release

i.e `yarn add tinacms` or `yarn add tinacms@latest`

1. **Merge Changes**

   ```
   git checkout latest
   git merge next
   git push
   ```

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
     --allow-branch latest \
     -m "chore(publish): latest"
   ```

1. **Clean the CHANGELOGs**

   ```
   lcc ** && git commit -am "chore: clean changelogs"
   ```

1) **Publish to NPM:**

   ```
   lerna publish from-package
   ```

1) **Push CHANGELOGs and git tags to Github:**
   ```
   git push && git push --tags
   ```

1. **Backmerge to `next`**

   ```
   git checkout next
   git merge latest
   git push
   ```
