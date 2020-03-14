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

  const pathToTinaPackages = `${pathToTina}/packages`
  if (packagesToAlias) {
    packagesToAlias.forEach(packageToAlias => {
      aliasRelative(
        config,
        packageToAlias,
        `${pathToTinaPackages}/${packageToAlias}`
      )
    })
  } else {
    fs.readdir(pathToTinaPackages, (err, files) => {
      if (err) {
        throw err
      } else {
        files.forEach(packageToAlias => {
          aliasRelative(
            config,
            packageToAlias,
            `${pathToTinaPackages}/${packageToAlias}`
          )
        })
      }
    })
  }
  // console.log(config.resolve.alias)
}

module.exports = {
  aliasTinaDev,
  aliasRelative,
  aliasLocal,
}
