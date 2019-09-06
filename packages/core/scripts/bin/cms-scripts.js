#!/usr/bin/env node
const path = require('path')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript2')
const rollupCommonJs = require('rollup-plugin-commonjs')
const typescript = require('typescript')
const { uglify } = require('rollup-plugin-uglify')

// Source https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/bin/react-scripts.js#L11-L16
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

/**
 * Commandline Parsing
 */
const program = require('commander')
const { version } = require('../package.json')

let commandName

program
  .version(version)
  .arguments('<cmd>')
  .action(cmd => (commandName = cmd))
  .parse(process.argv)

const COMMANDS = {
  build() {
    build(createBuildOptions({ uglify: true }))
  },
  watch() {
    watch(createBuildOptions())
  },
}

if (!commandName) {
  console.error('no command given!')
  process.exit(1)
}

const command = COMMANDS[commandName]
if (!command) {
  console.error(`unrecognized command: ${commandName}`)
  process.exit(1)
}

command()

/**
 * Build Packages
 */
function createBuildOptions(options = {}) {
  const absolutePath = process.cwd()

  const package = require(path.join(absolutePath, 'package.json'))
  console.log(`Building Package: ${package.name}@${package.version}`)

  const externalKeys = Object.keys(package.peerDependencies || {})

  const inputOptions = {
    input: path.join(absolutePath, 'src', 'index.ts'),
    external: targetId => {
      return !!externalKeys.find(extId => {
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

  if (options.uglify) {
    inputOptions.plugins.push(uglify())
  }

  const outputOptions = {
    file: path.join(absolutePath, package.main),
    name: package.browserName || package.name,
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

async function watch({ inputOptions, outputOptions }) {
  const watchOptions = {
    ...inputOptions,
    output: [outputOptions],
    watch: {},
  }

  rollup.watch(watchOptions)
}
