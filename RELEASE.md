# Releasing

## Canary

Canary release are automatically created when commits are pushed to `master`.

## Prerelease

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
   ```

## Release

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
   ```
