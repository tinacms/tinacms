/**



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
    packagesToAlias.forEach((packageToAlias) => {
      aliasRelative(
        config,
        packageToAlias,
        `${pathToTinaPackages}/${packageToAlias}`
      )
    })
  } else {
    const files = fs.readdirSync(pathToTinaPackages)

    files.forEach((packageToAlias) => {
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
