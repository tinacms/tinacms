#!/usr/bin/bash
# This script will cp all of our examples into the @strivemath/create-tina-app script and swap out the package.json
rsync -r --exclude=basic --exclude=*/.git/* --exclude=README.md --exclude=*/.node_modules* --exclude=*/.next* --exclude=*/.out* ./examples/* ./packages/@strivemath/create-tina-app/examples/

cd ./packages/@strivemath/create-tina-app/examples

for f in * ; do
    echo transfroming $f ...
    cd $f
    node ../../../../scripts/transformDeps.js
    cd ..
done
