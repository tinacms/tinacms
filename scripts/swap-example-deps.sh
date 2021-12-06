#!/usr/bin/bash
# This script will cp all of our examples into the create-tina-app script and swap out the package.json
rsync -r --exclude=basic --exclude=*/.git/* --exclude=README.md --exclude=*/.node_modules* --exclude=*/.next* --exclude=*/.out* ./examples/* ./packages/create-tina-app/examples/

cd ./packages/create-tina-app/examples

for f in * ; do
    echo transfroming $f ...
    cd $f
    node ../../../../scripts/transformDeps.js
    cd ..
done
