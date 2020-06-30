#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

# 1. Update Matser
git checkout master
git pull

# 2. Update Latest
git checkout latest
git pull
git merge master

# 3. Run a Fresh Build
npm run hard-reset
git add .
git commit -am "chore: package-lock"

# 4. Generate CHANGELOGs and Git Tags
lerna version \
  --yes \
  --conventional-commits \
  --conventional-graduate \
  --no-push \
  --allow-branch latest \
  -m "chore(publish): latest" \
  --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json'

# 5. Publish to NPM
lerna publish from-package --yes

# 6. Push CHANGELOGs and tags to GitHub
git push && git push --tags

# 7. Backmerge to master
git checkout master
git merge latest
git push
