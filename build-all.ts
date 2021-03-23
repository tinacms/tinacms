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

  console.log('ap', absolutePath)
  const pkg = require(path.join(absolutePath, 'package.json'))
  console.log(`Building Package: ${pkg.name}@${pkg.version}`)

  const dependencyKeys = Object.keys(pkg.dependencies || {})
  const peerDependencyKeys = Object.keys(pkg.peerDependencies || {})

  const inputOptions: rollup.InputOptions = {
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

// @ts-ignore
async function build({ inputOptions, outputOptions }) {
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

// @ts-ignore
const findParentPkgDesc = async (directory: string) => {
  if (!directory) {
    // @ts-ignore
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

const getLernaPackages = async () => {
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
  const pkgs = await getLernaPackages()
  const origPwd = process.cwd()
  if (!skipInitialBuild) {
    sequential(pkgs, async pkg => {
      // @ts-ignore
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
    // @ts-ignore
    pkgs.map(entry => `${entry.location}/src/**/*`),
    {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored: ['**/{.git,node_modules}/**', 'build', 'dist'],
    }
  )
  watcher.on('all', async (type, file) => {
    const packageLocation = path.dirname(
      await findParentPkgDesc(path.dirname(file))
    )
    process.chdir(packageLocation)
    // FIXME: For some reason this fails when watching with an error about one the files inside not existing
    await fs.emptyDirSync(path.join(packageLocation, '.rts2_cache'))
    console.log('changing to ', packageLocation)
    try {
      await build(createBuildOptions())
    } catch (e) {
      console.error(e)
    }
    process.chdir(origPwd)
  })
}
run(true)
