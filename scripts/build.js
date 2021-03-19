const tsup = require('tsup')
const { watch } = require('chokidar')
const fs = require('fs')
const path = require('path')
const fg = require('fast-glob')
const chalk = require('chalk')
const { spawnSync } = require('child_process')

const findParentPkgDesc = async directory => {
  if (!directory) {
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

  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    accum.push(result)
  }

  return accum
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const build = async pd => {
  // await sleep(4000)
  const pkg = JSON.parse(await fs.readFileSync(pd).toString())
  const pkgDir = path.dirname(pd)
  console.log(
    chalk.bgBlue.gray(' CLI '),
    chalk.magenta(pkg.name),
    'rebuilding...'
  )
  const outDir = path.resolve(pkgDir, path.dirname(pkg.main))
  const origDir = process.cwd()
  // set the cwd to the package that changed
  // so tsup can run as if it was initialized there
  process.chdir(pkgDir)
  const entryPoints = path.resolve(pkgDir, 'src', 'index.ts')

  if (!fs.existsSync(entryPoints)) {
    // set the cwd back to the original
    process.chdir(origDir)
    return true
  }

  const config = {
    entryPoints,
    outDir: outDir,
    dts: true,
    format: ['cjs'],
  }
  await tsup.build(config)
  if (
    (pkg.typings && pkg.typings.startsWith('dist')) ||
    (pkg.types && pkg.types.startsWith('dist'))
  ) {
    const types = await fs.readFileSync(path.join(pkgDir, 'dist/index.d.ts'))
    try {
      await fs.mkdirSync(path.join(pkgDir, 'dist/src'))
    } catch (e) {}
    await fs.writeFileSync(
      path.join(pkgDir, 'dist/src/index.d.ts'),
      types.toString()
    )
  }
  // set the cwd back to the original
  process.chdir(origDir)
  return true
}

const run = async () => {
  const lerna = JSON.parse(
    await fs.readFileSync(path.join(process.cwd(), 'lerna.json')).toString()
  )
  // FIXME: probs need to make sure this only runs for packages
  // so demos and things like that don't run
  const entries = await fg(lerna.packages, { dot: true, onlyDirectories: true })

  console.log('Initial build in topological order...')
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

  await sequential(lernaPackages, async pkgInfo => {
    return build(path.join(pkgInfo.location, 'package.json'))
  })
  console.log(chalk.magenta('Done with intial build, watching...'))

  const watcher = watch(
    entries.map(entry => `${entry}/src/**/*`),
    {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored: ['**/{.git,node_modules}/**', 'build', 'dist'],
    }
  )

  watcher.on('all', async (type, file) => {
    const packageLocation = await findParentPkgDesc(path.dirname(file))
    build(packageLocation)
  })
}

run()
