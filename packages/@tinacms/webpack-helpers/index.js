/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

const path = require('path')
const fs = require('fs')

function aliasRelative(config, name, pathToPackage) {
  config.resolve.alias[name] = path.resolve(pathToPackage)
}

function aliasLocal(config, name) {
  aliasRelative(config, name, path.resolve(`./node_modules/`, name))
}

function aliasTinaDev(config, pathToTina, packagesToAlias) {
  config.resolve.alias['react'] = path.resolve('./node_modules/react')

  const pathToTinaPackages = path.resolve(pathToTina, `packages`)

  if (packagesToAlias) {
    packagesToAlias.forEach(packageToAlias => {
      aliasRelative(
        config,
        packageToAlias,
        `${pathToTinaPackages}/${packageToAlias}`
      )
    })
  } else {
    const files = fs.readdirSync(pathToTinaPackages)

    files.forEach(packageToAlias => {
      aliasRelative(
        config,
        packageToAlias,
        `${pathToTinaPackages}/${packageToAlias}`
      )
    })
  }
}

module.exports = {
  aliasTinaDev,
  aliasRelative,
  aliasLocal,
}
