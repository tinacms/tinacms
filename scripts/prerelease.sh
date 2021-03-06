#!/bin/bash

# Check for $GH_TOKEN
if [[ -z $GH_TOKEN ]]
then
  echo "ENV '\$GH_TOKEN' is required to proceed; learn more at https://github.com/lerna/lerna/blob/main/commands/version/README.md#--create-release-type"
  exit 1
fi

# Terminate after the first line that fails (returns nonzero exit code)
set -e

# 0. Ensure no uncommitted changes
source $(dirname $0)/require_clean_work_tree.sh
require_clean_work_tree

# 1. Checkout Matser
git checkout master
git pull

# 2. Run a Fresh Build
npm run hard-reset

# 3. Generate CHANGELOGs and Git Tags
npm run lerna -- version \
  --yes \
  --conventional-commits \
  --conventional-prerelease \
  --no-git-tag-version \
  --no-changelog \
  --no-push \
  --allow-branch master \
  --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json'

# 4. Commit Version Updates
git add .
git commit -m "chore(publish): prerelease version bumps"

# 4. Publish to NPM
npm run lerna -- publish from-package \
  --yes \
  --dist-tag next

# 5. Push any changes
git push
