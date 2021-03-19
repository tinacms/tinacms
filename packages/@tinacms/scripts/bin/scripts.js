#!/usr/bin/env node
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
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript2')
const rollupReplace = require('rollup-plugin-replace')
const rollupCommonJs = require('rollup-plugin-commonjs')
const tsup = require('tsup')
const typescript = require('typescript')
const { uglify } = require('rollup-plugin-uglify')
const createStyledComponentsTransformer = require('typescript-plugin-styled-components')
  .default

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
    const options = createBuildOptions({ uglify: false, debug: true })
    console.log(path.dirname(options.outputOptions.file))
    tsup.build({
      entryPoints: [options.inputOptions.input],
      outDir: path.dirname(options.outputOptions.file),
      dts: true,
      format: ['cjs'],
    })
    // build(createBuildOptions({ uglify: true, debug: false }))
  },
  dev() {
    build(createBuildOptions({ uglify: false, debug: true }))
  },
  watch() {
    const options = createBuildOptions({ uglify: false, debug: true })
    const dirname = path.dirname(options.outputOptions.file)
    tsup.build({
      entryPoints: [options.inputOptions.input],
      dts: true,
      outDir: dirname,
      // tsup/chokidar gets mixed up between absolute and relative, so give both
      ignoreWatch: [dirname, path.basename(dirname)],
      watch: true,
      format: ['cjs'],
    })
    // watch(createBuildOptions({ uglify: false, debug: true }))
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

  const dependencyKeys = Object.keys(package.dependencies || {})
  const peerDependencyKeys = Object.keys(package.peerDependencies || {})

  const inputOptions = {
    input: path.join(absolutePath, 'src', 'index.ts'),
    external: [...dependencyKeys, ...peerDependencyKeys],
    plugins: [
      rollupTypescript({
        typescript,
        tsconfig: path.join(absolutePath, 'tsconfig.json'),
        cacheRoot: path.join(absolutePath, '.rts2_cache'),
        include: [
          path.join(absolutePath, 'src', '*.ts+(|x)'),
          path.join(absolutePath, 'src', '**/*.ts+(|x)'),
        ],
        transformers: [
          () => ({
            before: [createStyledComponentsTransformer()],
          }),
        ],
      }),
      rollupReplace({
        DEBUG: options.debug,
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
