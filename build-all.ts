import path from 'path'
import fs from 'fs-extra'
import * as rollup from 'rollup'
import rollupTypescript from 'rollup-plugin-typescript2'
import rollupReplace from 'rollup-plugin-replace'
import rollupCommonJs from 'rollup-plugin-commonjs'
import typescript from 'typescript'
import { watch } from 'chokidar'
import createStyledComponentsTransformer from 'typescript-plugin-styled-components'
import { spawnSync } from 'child_process'

/**
 * Build Packages
 */
const createBuildOptions = () => {
  const absolutePath = process.cwd()

  const pkg = require(path.join(absolutePath, 'package.json'))
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
        DEBUG: 'false',
      }),
      rollupCommonJs({
        sourceMap: true,
      }),
    ],
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

const run = async (skipInitialBuild: boolean = false) => {
  console.log('running build', 'skip initial:', skipInitialBuild)
  const pkgs = await getLernaPackages()
  const origPwd = process.cwd()
  if (!skipInitialBuild) {
    sequential(pkgs, async pkg => {
      process.chdir(pkg.location)
      try {
        await build(createBuildOptions())
      } catch (e) {
        console.error(e)
      }
      process.chdir(origPwd)
    })
  }
  const watcher = watch(
    pkgs.map(entry => `${entry.location}/src/**/*`),
    {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored: ['**/{.git,node_modules}/**', 'build', 'dist'],
    }
  )

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
    console.log(`Detected change in ${packageLocation}, rebuilding...`)
    // Change process.cwd() so the rollup process works as if it was running in that directory
    process.chdir(packageLocation)
    try {
      await build(createBuildOptions())
    } catch (e) {
      console.error(e)
    }
    // Change it back to the pwd that the process was actually started in.
    process.chdir(origPwd)
  })
}
run(true)
