#!/bin/bash

# chmod ug+x <<FILE NAME>> | to set permissions

echo "Adding Licenses..."

declare -a ignoreFiles=(
  ".pnp.js"
  )

for file in `find $PWD \( -name .yarn -prune \) -or \( -name "*.js" -or -name "*.ts" -or -name "*.tsx" \) -not -path "*/examples/*" -not -path "*/experimental-examples/*" -not -path "*/build/*" -not -path "*/.yarn/*" -not -path "*/deprecated-packages/*"   -not -path "*/cypress/*"  -not -path "*/node_modules/*"    -print  -type f`

do
  if [[ $file == *"${ignoreFiles[*]}"* ]]
  then
    echo "ignored: ${file##*/}"
  else
    differance=$(comm -13 <(sort -u $file) <(sort -u scripts/license.txt))
    if [[ $differance ]]
    then
      echo "adding license to: ${file##*/}"
      cat scripts/license.txt $file > $file.tmp && mv $file.tmp $file
    fi
  fi
  
done
echo "Licenses have been added."

