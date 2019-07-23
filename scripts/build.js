const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript2')
const rollupCommonJs = require('rollup-plugin-commonjs')
const typescript = require('typescript')

/**
 * Commandline Parsing
 */
const commander = require('commander')
commander.option('-p, --package <name>', 'the package to build')
commander.parse(process.argv)

/**
 * Gater Packages to Build
 */
let packageNames = []

if (commander.package) {
  packageNames = [commander.package]
  console.log(`Building ${commander.package}`)
} else {
  packageNames = fs.readdirSync('packages')
  console.log('Building all packages.')
}

/**
 * Build Packages
 */
packageNames.map(createBuildOptions).forEach(build)

function createBuildOptions(name) {
  const absolutePath = path.join(__dirname, '..', 'packages', name)

  const package = require(path.join(absolutePath, 'package.json'))

  const externalKeys = Object.keys(package.peerDependencies || {})

  const inputOptions = {
    input: path.join(absolutePath, 'src/index.ts'),
    external: targetId => {
      return !!externalKeys.find(extId => {
        console.log(extId, targetId)
        return new RegExp(/^extId$/i).test(targetId)
      })
    },
    plugins: [
      rollupTypescript({
        typescript,
        tsconfig: path.join(absolutePath, 'tsconfig.json'),
        cacheRoot: path.join(absolutePath, '.rts2_cache'),
        include: [
          path.join(absolutePath, 'src', '*.ts+(|x)'),
          path.join(absolutePath, 'src', '**/*.ts+(|x)'),
        ],
      }),
      rollupCommonJs({
        sourceMap: true,
      }),
    ],
  }

  const outputOptions = {
    file: path.join(absolutePath, package.main),
    name: package.browserName || name,
    format: 'umd',
  }

  return {
    inputOptions,
    outputOptions,
  }
}

async function build({ inputOptions, outputOptions }) {
  const bundle = await rollup.rollup(inputOptions)

  await bundle.generate(outputOptions)

  await bundle.write(outputOptions)
}
