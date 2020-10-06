#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

git checkout master

DIFF="$1..$2"

git shortlog $DIFF -sn --no-merges