#!/bin/bash

echo "Deleting Licenses..."

declare -a ignoreFiles=(
  ".pnp.js"
  )

for file in `find $PWD \( -name .yarn -prune \) -or \( -name "*.js" -or -name "*.ts" -or -name "*.tsx" \) -print  -type f`
do
  if [[ $file == *"${ignoreFiles[*]}"* ]]
  then
    echo "ignored: ${file##*/}"
  else
    differance=$(comm -13 <(sort -u $file) <(sort -u scripts/license.txt))
    if [[ ! $differance ]]
    then
      echo "deleting license from: ${file##*/}"
      comm -23 $file scripts/license.txt > $file.tmp
      mv $file.tmp $file
    fi
  fi
done

echo "Licenses have been deleting."