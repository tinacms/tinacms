#!/bin/bash

require_clean_work_tree () {
    # Update the index
    git update-index -q --ignore-submodules --refresh
    err=0

    # Disallow unstaged changes in the working tree
    if ! git diff-files --quiet --ignore-submodules --
    then
        echo >&2 "cannot $1: you have unstaged changes."
        git diff-files --name-status -r --ignore-submodules -- >&2
        err=1
    fi

    # Disallow uncommitted changes in the index
    if ! git diff-index --cached --quiet HEAD --ignore-submodules --
    then
        echo >&2 "cannot $1: your index contains uncommitted changes."
        git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2
        err=1
    fi

    if [ $err = 1 ]
    then
        echo >&2 "Please commit or stash them."
        exit 1
    fi
}


# Terminate after the first line that fails (returns nonzero exit code)
set -e

# 0.1. Confirm Action
read -p "Create a new release? Type the word 'release' to confirm: "
if [[ ! $REPLY =~ ^release$ ]]
then
  echo "Release canceled."
  exit 1
fi

#0.2. Ensure no uncommitted changes
require_clean_work_tree

# 1. Update Matser
git checkout master
git pull

# 2. Update Latest
git checkout latest
git pull
git merge master

# 3. Run a Fresh Build
npm run hard-reset

# 4. Generate CHANGELOGs and Git Tags
#    You must have GH_TOKEN in your environment variables
lerna version \
  --yes \
  --conventional-commits \
  --conventional-graduate \
  --allow-branch latest \
  --create-release github \
  -m "chore(publish): latest" \
  --ignore-changes '**/*.md' '**/*.test.tsx?' '**/package-lock.json' '**/tsconfig.json' \
  --no-granular-pathspec

# 5. Publish to NPM
lerna publish from-package --yes

# 7. Backmerge to master
git checkout master
git merge latest
git push
