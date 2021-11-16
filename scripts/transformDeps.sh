# this is ment to be run localy 
git fetch
git pull origin main
git pull origin examples
git merge origin main
git checkout examples --
yarn swapDeps
git commit -am "update deps"
git push origin examples
git checkout -