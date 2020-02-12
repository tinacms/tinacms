# Creating Releases

This document is a reference for maintainers when creating releases for TinaCMS.

## Canary

Canary release are automatically created when commits are pushed to `master`.

## Prerelease

i.e. `yarn add tinacms@next`

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

1. **Push CHANGELOGs and git tags to Github:**

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

1. **Backmerge to `next`**

   ```
   git checkout master
   git merge latest
   git push
   ```

## Listing Contributors

To generate a list of contributors

**By # of Commits**

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

**With Links to Commits**

Command:

```

git shortlog tinacms@PREV..tinacms@LATEST \
 -n \
 --no-merges \
 --format="%s (https://github.com/tinacms/tinacms/commit/%h)"

```

Example Output:

```
Nolan Phillips (4):
      chore: version bump (https://github.com/tinacms/tinacms/commit/d5a2dc3e)
      fix: server should start without an origin (https://github.com/tinacms/tinacms/commit/ad59ccf4)
      test: without a remote updateRemoteToSSH does nothing (https://github.com/tinacms/tinacms/commit/9a1c05a0)
      chore(publish): latest (https://github.com/tinacms/tinacms/commit/1ab2b192)

Thomas Weibenfalk (2):
      fixed sticky menu (https://github.com/tinacms/tinacms/commit/e864f4f5)
      Un-stuck menu when reaching bottom of WYSIWYG fixed (https://github.com/tinacms/tinacms/commit/cec271be)

Scott Byrne (1):
      chore: update lock files (https://github.com/tinacms/tinacms/commit/74804219)
```
