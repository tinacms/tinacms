import path from 'path'
import fs from 'fs-extra'
import * as rollup from 'rollup'
import rollupTypescript from 'rollup-plugin-typescript2'
import rollupReplace from 'rollup-plugin-replace'
import rollupCommonJs from 'rollup-plugin-commonjs'
import typescript from 'typescript'
import { watch } from 'chokidar'
// @ts-ignore
import uglifyPlugin from 'rollup-plugin-uglify'
import createStyledComponentsTransformer from 'typescript-plugin-styled-components'
import { spawnSync } from 'child_process'
import program from 'commander'

/**
 * Build Packages
 */
type CreateBuildOptionsArgs = { uglify: boolean; debug: boolean }
const createBuildOptions = ({ uglify, debug }: CreateBuildOptionsArgs) => {
  const absolutePath = process.cwd()

  const pkg = require(path.join(absolutePath, 'package.json'))
  // Ugly hack here just to make sure the build command is actually using this script
  if (!pkg.scripts || pkg.scripts.build !== 'tinacms-scripts build') {
    throw new Error(
      `${pkg.name} does is not using the tinacms-scripts build script, skipping...`
    )
  }

  console.log(`Building Package: ${pkg.name}@${pkg.version}`)

  const dependencyKeys = Object.keys(pkg.dependencies || {})
  const peerDependencyKeys = Object.keys(pkg.peerDependencies || {})

  const inputOptions: rollup.InputOptions = {
    input: path.join(absolutePath, 'src', 'index.ts'),
    // WIP - these warnings should mostly not show up, we need to fix some of our missing dependencies
    external: [...dependencyKeys, ...peerDependencyKeys],
    plugins: [
      rollupTypescript({
        typescript,
        tsconfig: path.join(absolutePath, 'tsconfig.json'),
        // without clean: true the cache blows up on multiple saves of the same file
        clean: true,
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
        DEBUG: debug ? 'true' : 'false',
      }),
      rollupCommonJs({
        sourceMap: true,
      }),
    ],
  }

  if (uglify && inputOptions.plugins) {
    inputOptions.plugins.push(uglifyPlugin())
  }

  const outputOptions: rollup.OutputOptions = {
    file: path.join(absolutePath, pkg.main),
    name: pkg.browserName || pkg.name,
    format: 'umd',
  }

  return {
    inputOptions,
    outputOptions,
  }
}

async function build({
  inputOptions,
  outputOptions,
}: {
  inputOptions: rollup.InputOptions
  outputOptions: rollup.OutputOptions
}) {
  const bundle = await rollup.rollup(inputOptions)

  await bundle.generate(outputOptions)

  await bundle.write(outputOptions)
}

// Like await Promise.all() but will run sequentially
const sequential = async <A, B>(
  items: A[],
  callback: (args: A) => Promise<B>
) => {
  const accum: B[] = []

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous
    // initial value will be undefined
    if (prev) {
      accum.push(prev)
    }

    return callback(endpoint)
  }

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result)
  }

  return accum
}

const findParentPkgDesc = async (directory: string): Promise<null | string> => {
  if (!directory && module.parent) {
    directory = path.dirname(module.parent.filename)
  }
  const file = path.resolve(directory, 'package.json')
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return file
  }
  const parent = path.resolve(directory, '..')
  if (parent === directory) {
    return null
  }
  return findParentPkgDesc(parent)
}

const getLernaPackages = async (): Promise<{ location: string }[]> => {
  const child = await spawnSync('npm', [
    'run',
    'lerna',
    'ls',
    '--',
    '--toposort',
    '--json',
  ])
  const stringOutput = child.stdout.toString()

  const cleanedString = stringOutput
    .split('\n')
    .slice(4)
    .join('\n')
  const lernaPackages = JSON.parse(cleanedString)
  return lernaPackages
}

const buildAll = async ({
  skipInitialBuild = false,
  ...rest
}: { skipInitialBuild: boolean } & CreateBuildOptionsArgs) => {
  console.log('running build', 'skip initial:', skipInitialBuild)
  const pkgs = await getLernaPackages()
  const origPwd = process.cwd()
  if (!skipInitialBuild) {
    sequential(pkgs, async pkg => {
      process.chdir(pkg.location)
      try {
        await build(createBuildOptions(rest))
      } catch (e) {
        console.error(e.message)
      }
      process.chdir(origPwd)
    })
  }
  //  '*.ts+(|x)'
  // '**/*.ts+(|x)'
  const paths: string[] = []
  pkgs.forEach(entry => {
    paths.push(`${entry.location}/!(*.d).ts+(|x)`)
    paths.push(`${entry.location}/**/!(*.d).ts+(|x)`)
  })
  const watcher = watch(paths, {
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored: ['**/{.git,node_modules}/**', 'build', 'dist'],
  })

  console.log('watching for changes')
  watcher.on('all', async (type, file) => {
    const changedPkg = await findParentPkgDesc(file)
    if (!changedPkg) {
      console.log(
        'Unable to find package associated with the change, not sure what happened there...'
      )
      return
    }
    const packageLocation = path.dirname(changedPkg)
    console.log(
      `Detected change in ${packageLocation}, at file ${file} rebuilding...`
    )
    // Change process.cwd() so the rollup process works as if it was running in that directory
    process.chdir(packageLocation)
    try {
      await build(createBuildOptions(rest))
    } catch (e) {
      console.error(e.message)
    }
    // Change it back to the pwd that the process was actually started in.
    process.chdir(origPwd)
  })
}

let commandName

program
  .arguments('<cmd>')
  .action(cmd => (commandName = cmd))
  .parse(process.argv)

const COMMANDS = {
  build() {
    build(createBuildOptions({ uglify: true, debug: false }))
  },
  dev() {
    build(createBuildOptions({ uglify: false, debug: true }))
  },
  watch() {
    build(createBuildOptions({ uglify: false, debug: true }))
  },
  watchAll() {
    buildAll({ skipInitialBuild: false, uglify: false, debug: true })
  },
  watchAllSkipInitial() {
    buildAll({ skipInitialBuild: true, uglify: false, debug: true })
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

// @ts-ignore
command()
