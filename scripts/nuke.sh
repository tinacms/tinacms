#!/bin/bash

# Deletes all node_modules
lerna clean -y

# Directories to be deleted
declare -a build_dirs

build_dirs=(
  'build'
  'loader'
  'www'
  'dist'
  '.stencil'
  '.rts2_cache'
  '.rts2_cache_cjs'
  '.rts2_cache_esm'
)

for i in "${build_dirs[@]}"
do
  find packages -type d -name $i -prune -exec rm -rf '{}' +
done