#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

# source $(dirname $0)/require_gh_token.sh
source $(dirname $0)/require_clean_work_tree.sh

# 0.1. Confirm Action
read -p "Create a new release? Type the word 'release' to confirm: "
if [[ ! $REPLY =~ ^release$ ]]
then
  echo "Release canceled."
  exit 1
fi

#0.2. Ensure no uncommitted changes
require_clean_work_tree

#0.3 Check if GH_TOKEN present and has correct permissions
# require_gh_token

# 1. Update develop (ein/develop)
git checkout ein/develop
git pull

# 2. Update latest (ein/main)
git checkout ein/main
git pull
git merge ein/develop

echo "Running a fresh build..."

# 3. Run a fresh build
npm run hard-reset
npx lerna run --parallel generate-lock-file

echo "Updating versions..."

# 4. Generate CHANGELOGs and Git Tags
#    You must have GH_TOKEN in your environment variables
npm run lerna -- version \
  --force-publish
  # --yes \
  # --conventional-commits \
  # --conventional-graduate \
  # --allow-branch ein/main \
  # --create-release github \
  # -m "chore(publish): latest" \
  # --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json' \
  # --no-granular-pathspec

echo "Publishing to NPM..."

# 5. Publish to NPM
npm run lerna -- publish from-package --yes

echo "Backmerge..."

# 7. Backmerge to develop (ein/develop)
git checkout ein/develop
git merge ein/main
git push

echo "Release successful!"
