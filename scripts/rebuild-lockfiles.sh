# Deletes all package node_modules
lerna clean -y

# Delete package-lock and re-run install
lerna exec -- "rm package-lock.json || :"
lerna exec -- "npm install"