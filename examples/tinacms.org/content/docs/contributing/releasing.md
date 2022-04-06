---
title: Contribution Releases
id: /docs/contributing/releasing
prev: /docs/contributing/setting-up
next: /docs/contributing/troubleshooting
consumes:
  - file: /RELEASE.md
    details: 'Shares the release process, should mirror'
  - file: /lerna.json
    details: Uses publish command
  - file: README.md
    details: 'Shows crelease process, should mirror'
---

## Overarching Process

Tina has three main branches:

- **master:** The bleeding edge of tinacms
- **next:** A preview of the next release
- **latest:** The current stable release

The flow of changes therefore looks like:

> `fix-some-bug` => `master` => `next` => `latest`

The process happens over a week:

- On Monday
  1. `next` is merged into `latest`; then `latest` is published to npm
  2. `master` is merged into `next`; then `next` is published to npm
- Any hot fixes for bugs will be cherry picked into `next` and `latest`
  and the published accordingly.
- Every pull request merged to `master` automatically triggers a
  `canary` release.

With this process:

- all accepted changes are available as `canary` releases for early testing
- critical fixes are published as soon as possible
- new features and minor fixes take ~1.5 weeks to be published

## Steps to Release

The general release process looks like this:

1. **Build the source files:**

   The source must be compiled, minified, and uglified in preparation for release.

1. **Generate CHANGELOGs and Git tags:**

   We use `lerna` to generate CHANGELOG files automatically from our commit messages.

1. **Clean the CHANGELOGs**

   Lerna sometimes adds empty changelog entries. For example, if `react-tinacms` is changed
   then `tinacms` will get get a patch update with only the dependency updated. Make sure to install `lerna-clean-changelog-cli`:

   ```
   npm i -g lerna-clean-changelogs-cli
   ```

1. **Publish to NPM:**

   You must have an NPM_TOKEN set locally that has access to the `@tinacms` organization

1. **Push CHANGELOGs and Git tags to Github:**

   Let everyone know!

The exact commands vary slightly depending on the type of release being made.

### Prerelease

1. **Build the source files:**

   ```
   npm run build
   ```

1. **Generate CHANGELOGs and Git tags:**

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
1. **Push CHANGELOGs and Git tags to Github:**
   ```
   git push && git push --tags
   ```

### Graduating Prereleases

1. **Build the source files:**

   ```
   npm run build
   ```

1. **Generate CHANGELOGs and Git tags:**

   ```
   lerna version \
     --conventional-commits \
     --conventional-graduate \
     --no-push \
     --allow-branch next \
     -m "chore(publish): graduation"
   ```

1. **Clean the CHANGELOGs**

   ```
   lcc ** && git commit -am "chore: clean changelogs"
   ```

1) **Publish to NPM:**

   ```
   lerna publish from-package
   ```

1) **Push CHANGELOGs and Git tags to Github:**
   ```
   git push && git push --tags
   ```

### Release

1. **Build the source files:**

   ```
   npm run build
   ```

1. **Generate CHANGELOGs and Git tags:**

   ```
   lerna version \
     --conventional-commits \
     --no-push \
     --allow-branch master \
     -m "chore(publish): release"
   ```

1. **Clean the CHANGELOGs**

   ```
   lcc ** && git commit -am "chore: clean changelogs"
   ```

1. **Publish to NPM:**
   ```
   lerna publish from-package
   ```
1. **Push CHANGELOGs and Git tags to Github:**
   ```
   git push && git push --tags
   ```
