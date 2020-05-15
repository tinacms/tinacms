#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

# 1. Checkout Matser
git checkout master
git pull

# 2. Run a Fresh Build
npm run hard-reset
git add .
git commit -am "chore: package-lock"

# 3. Generate CHANGELOGs and Git Tags
lerna version \
  --yes \
  --conventional-commits \
  --conventional-prerelease \
  --no-push \
  --allow-branch master \
  -m "chore(publish): prerelease" \
  --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json'

# 4. Publish to NPM
lerna publish from-package \
  --yes \
  --dist-tag next

# 5. Push CHANGELOGs and tags to GitHub
git push && git push --tags