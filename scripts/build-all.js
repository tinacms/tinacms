'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const tslib_1 = require('tslib')
const path_1 = tslib_1.__importDefault(require('path'))
const fs_extra_1 = tslib_1.__importDefault(require('fs-extra'))
const rollup = tslib_1.__importStar(require('rollup'))
const rollup_plugin_typescript2_1 = tslib_1.__importDefault(
  require('rollup-plugin-typescript2')
)
const rollup_plugin_replace_1 = tslib_1.__importDefault(
  require('rollup-plugin-replace')
)
const rollup_plugin_commonjs_1 = tslib_1.__importDefault(
  require('rollup-plugin-commonjs')
)
const typescript_1 = tslib_1.__importDefault(require('typescript'))
const chokidar_1 = require('chokidar')
const typescript_plugin_styled_components_1 = tslib_1.__importDefault(
  require('typescript-plugin-styled-components')
)
const child_process_1 = require('child_process')
/**
 * Build Packages
 */
const createBuildOptions = () => {
  const absolutePath = process.cwd()
  const pkg = require(path_1.default.join(absolutePath, 'package.json'))
  console.log(`Building Package: ${pkg.name}@${pkg.version}`)
  const dependencyKeys = Object.keys(pkg.dependencies || {})
  const peerDependencyKeys = Object.keys(pkg.peerDependencies || {})
  const inputOptions = {
    input: path_1.default.join(absolutePath, 'src', 'index.ts'),
    // WIP - these warnings should mostly not show up, we need to fix some of our missing dependencies
    external: [...dependencyKeys, ...peerDependencyKeys],
    plugins: [
      rollup_plugin_typescript2_1.default({
        typescript: typescript_1.default,
        tsconfig: path_1.default.join(absolutePath, 'tsconfig.json'),
        // without clean: true the cache blows up on multiple saves of the same file
        clean: true,
        include: [
          path_1.default.join(absolutePath, 'src', '*.ts+(|x)'),
          path_1.default.join(absolutePath, 'src', '**/*.ts+(|x)'),
        ],
        transformers: [
          () => ({
            before: [typescript_plugin_styled_components_1.default()],
          }),
        ],
      }),
      rollup_plugin_replace_1.default({
        DEBUG: 'false',
      }),
      rollup_plugin_commonjs_1.default({
        sourceMap: true,
      }),
    ],
  }
  const outputOptions = {
    file: path_1.default.join(absolutePath, pkg.main),
    name: pkg.browserName || pkg.name,
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
const sequential = async (items, callback) => {
  const accum = []
  const reducePromises = async (previous, endpoint) => {
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
const findParentPkgDesc = async directory => {
  if (!directory && module.parent) {
    directory = path_1.default.dirname(module.parent.filename)
  }
  const file = path_1.default.resolve(directory, 'package.json')
  if (
    fs_extra_1.default.existsSync(file) &&
    fs_extra_1.default.statSync(file).isFile()
  ) {
    return file
  }
  const parent = path_1.default.resolve(directory, '..')
  if (parent === directory) {
    return null
  }
  return findParentPkgDesc(parent)
}
const getLernaPackages = async () => {
  const child = await child_process_1.spawnSync('npm', [
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
const run = async (skipInitialBuild = false) => {
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
  const watcher = chokidar_1.watch(
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
    const packageLocation = path_1.default.dirname(changedPkg)
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
