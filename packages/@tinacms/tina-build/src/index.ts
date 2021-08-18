import { build } from 'vite'
import { build as tsupbuild } from 'tsup'
import { buildSync, build as esbuild } from 'esbuild'
// import dts from 'vite-plugin-dts'
// import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'
// import { build as esbuild } from 'esbuild'
// import nodePolyfills from 'rollup-plugin-node-polyfills'
import dts from 'rollup-plugin-dts'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import * as commander from 'commander'

export interface Command {
  resource?: string
  command: string
  alias?: string
  description: string
  action: (...args: any[]) => void
  examples?: string
  subCommands?: Command[]
  options?: Option[]
}

interface Option {
  name: string
  description: string
}

const program = new commander.Command('Tina Build')
const registerCommands = (commands: Command[], noHelp: boolean = false) => {
  commands.forEach((command, i) => {
    let newCmd = program
      .command(command.command, { noHelp })
      .description(command.description)
      .action((...args) => {
        command.action(...args)
      })

    if (command.alias) {
      newCmd = newCmd.alias(command.alias)
    }

    newCmd.on('--help', function () {
      if (command.examples) {
        console.log(`\nExamples:\n  ${command.examples}`)
      }
      if (command.subCommands) {
        console.log('\nCommands:')
        const optionTag = ' [options]'
        command.subCommands.forEach((subcommand, i) => {
          const commandStr = `${subcommand.command}${
            (subcommand.options || []).length ? optionTag : ''
          }`

          const padLength =
            Math.max(...command.subCommands.map((sub) => sub.command.length)) +
            optionTag.length
          console.log(
            `${commandStr.padEnd(padLength)} ${subcommand.description}`
          )
        })
      }
      console.log('')
    })
    ;(command.options || []).forEach((option) => {
      newCmd.option(option.name, option.description)
    })

    if (command.subCommands) {
      registerCommands(command.subCommands, true)
    }
  })
}

export const run = async (args: { watch?: boolean; dir?: string }) => {
  if (args.dir) {
    process.chdir(args.dir)
  }

  const packageDir = process.cwd()
  const packageJSON = JSON.parse(
    await fs.readFileSync(path.join(packageDir, 'package.json')).toString()
  )
  if (
    [
      '@tinacms/tina-build',
      '@tinacms/scripts',
      '@tinacms/webpack-helpers',
    ].includes(packageJSON.name)
  ) {
    console.log(`skipping ${packageJSON.name}`)
    return
  }
  // console.log(`${chalk.blue(`${packageJSON.name}`)} change detected`)
  // @ts-ignore

  const successMessage = `${chalk.blue(`${packageJSON.name}`)} built in`
  console.time(successMessage)

  const entries = packageJSON?.buildConfig?.entryPoints || ['src/index.ts']
  try {
    await sequential(entries, async (entry) => {
      return buildIt(entry, packageJSON)
    })

    if (args.dir) {
      console.timeEnd(successMessage)
    }
  } catch (e) {
    console.log(`Error building ${packageJSON.name}`)
    // console.error(e)
  }
}

export async function init(args: any) {
  registerCommands([
    {
      command: 'build',
      description: 'Build',
      options: [
        {
          name: '--watch',
          description: 'Watch for file changes and rebuild',
        },
      ],
      action: (options) => run(options),
    },
    {
      command: 'build:all',
      description: 'Build all packages',
      options: [
        {
          name: '--watch',
          description: 'Watch for file changes and rebuild',
        },
        {
          name: '--lines',
          description: 'add the lines',
        },
      ],
      action: (options) => all(options),
    },
  ])

  program.usage('command [options]')
  // error on unknown commands
  program.on('command:*', function () {
    console.error(
      'Invalid command: %s\nSee --help for a list of available commands.',
      args.join(' ')
    )
    process.exit(1)
  })

  program.on('--help', function () {
    console.log(`
You can get help on any command with "-h" or "--help".
e.g: "forestry types:gen --help"
    `)
  })

  if (!process.argv.slice(2).length) {
    // no subcommands
    program.help()
  }

  program.parse(args)
}

const buildIt = async (entry, packageJSON) => {
  const deps = packageJSON.dependencies
  // @ts-ignore
  const peerDeps = packageJSON.peerDependencies
  const external = Object.keys({ ...deps, ...peerDeps })
  const globals = {}
  external.forEach((ext) => (globals[ext] = 'NOOP'))
  if (['@tinacms/graphql', '@tinacms/cli'].includes(packageJSON.name)) {
    await esbuild({
      entryPoints: [path.join(process.cwd(), 'src/index.ts')],
      bundle: true,
      platform: 'node',
      outdir: path.join(process.cwd(), 'dist'),
      external,
    })
    // await tsupbuild({
    //   entryPoints: [path.join(process.cwd(), 'src/index.ts')],
    //   // entryPoints: ['src/index.ts'],
    //   format: ['cjs'],
    //   outDir: path.join(process.cwd(), 'dist'),
    //   // outDir: 'dist',
    //   // dts: true,
    // })
    return true
  }
  const defaultBuildConfig: Parameters<typeof build>[0] = {
    // plugins: [pnpPlugin(), dts()],
    build: {
      minify: false,
      lib: {
        entry: path.resolve(process.cwd(), entry),
        name: packageJSON.name,
        fileName: (format) => {
          const base = path.basename(entry)
          const ext = path.extname(entry)
          const name = base.replace(ext, '')
          if (format === 'umd') {
            return `${name}.js`
          }
          return `${name}.${format}.js`
        },
      },
      emptyOutDir: false, // we build multiple files in to the dir
      sourcemap: false, // true | 'inline' (note: inline will go straight into your bundle size)
      rollupOptions: {
        // /**
        //  * FIXME: rollup-plugin-node-polyfills is only needed for node targets
        //  */
        plugins: [],
        /**
         * For some reason Rollup thinks it needs a global, though
         * I'm pretty sure it doesn't, since everything works
         *
         * By setting a global for each external dep we're silencing these warnings
         * No name was provided for external module 'react-beautiful-dnd' in output.globals – guessing 'reactBeautifulDnd'
         *
         * They don't occur for es builds, only UMD and I can't quite find
         * an authoritative response on wny they're needed or how they're
         * used in the UMD context.
         *
         * https://github.com/rollup/rollup/issues/1514#issuecomment-321877507
         * https://github.com/rollup/rollup/issues/1169#issuecomment-268815735
         */
        output: {
          globals,
        },
        external,
      },
    },
  }
  const buildConfig = packageJSON.buildConfig
    ? {
        ...defaultBuildConfig,
        ...packageJSON.buildConfig,
      }
    : defaultBuildConfig

  await build({
    ...buildConfig,
  })
  /**
   * Not ideal, but we're using vite because of umd builds
   * and tsup still works great for type generation, so
   * using both. Vite's ts build might work, but it's all
   * done in one pass so the slow ts process defeats the purpose
   * of using vite in the first place. With 2 steps, it's
   * a bit more cumbersome but the builds are still fast
   * and types get built eventually
   */
  // await tsupbuild({
  //   entryPoints: [path.resolve(process.cwd(), entry)],
  //   format: ['cjs'],

  //   // Not specifying outDir will result in it being ts build only
  //   // outDir: path.join(process.cwd(), 'dist'),
  //   dts: true,
  // })
  return true
}

import pnp from 'pnpapi'
// const pnp = require(`pnpapi`)
import chokidar from 'chokidar'
// const chokidar = require('chokidar')
// import path from 'path'
// import chalk from 'chalk'
// const path = require('path')
// const chalk = require('chalk')

import { exec, execSync } from 'child_process'

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    execSync(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}
import execa from 'execa'

const all = async (args: { watch?: boolean; dir?: string }) => {
  const workspacePackageNames = []
  await sequential(pnp.getDependencyTreeRoots(), async (locator) => {
    const pkg = pnp.getPackageInformation(locator)
    const packageJSON = JSON.parse(
      await fs
        .readFileSync(path.join(pkg.packageLocation, 'package.json'))
        .toString()
    )
    workspacePackageNames.push(packageJSON.name)
  })
  const workspacePkgs = []
  await sequential(pnp.getDependencyTreeRoots(), async (locator) => {
    const pkg = pnp.getPackageInformation(locator)
    const packageJSON = JSON.parse(
      await fs
        .readFileSync(path.join(pkg.packageLocation, 'package.json'))
        .toString()
    )
    if (!packageJSON.private) {
      workspacePkgs.push(path.join(pkg.packageLocation, 'src'))
    }
  })
  if (args.watch) {
    console.log(`${chalk.blue(`Watching workspaces...`)}`)
    chokidar.watch(workspacePkgs).on('change', async (path) => {
      const packageLocator = pnp.findPackageLocator(path)
      const packageInformation = pnp.getPackageInformation(packageLocator)
      await run({ dir: packageInformation.packageLocation })
    })
  } else {
    console.log(`${chalk.blue(`Building workspaces...`)}`)
    const packagePathsToBuild = await fs
      .readFileSync(path.resolve('../../../topologicalDeps.txt'))
      .toString()
      .split('\n')
      .filter((stdout) => {
        return stdout.includes('tinacms/packages')
      })
      .map((line) => line.replace('➤ YN0000: ', ''))

    await sequential(packagePathsToBuild, async (packagePath) => {
      await run({ dir: packagePath })
    })
    // } else {
    //   console.log(`${chalk.blue(`Building workspaces...`)}`)
    //   await sequential(workspacePkgs, async (path) => {
    //     const packageLocator = pnp.findPackageLocator(path)
    //     const packageInformation = pnp.getPackageInformation(packageLocator)
    //     console.log(`${chalk.blue(`Building ${path}`)}`)
    //     await run({ dir: packageInformation.packageLocation })
    //   })
  }
}

const evaluatePackage = async ({
  packageInformation,
  packagejson,
  workspacePackageNames,
  builtPackageNames,
}) => {
  for await (const [
    name,
    referencish,
  ] of packageInformation.packageDependencies) {
    if (workspacePackageNames.includes(name)) {
      if (!builtPackageNames.includes(name)) {
        const childLocator = pnp.getLocator(name, referencish)
        const childInformation = pnp.getPackageInformation(childLocator)

        const childPackagejson = JSON.parse(
          await fs
            .readFileSync(
              path.join(childInformation.packageLocation, 'package.json')
            )
            .toString()
        )
        console.log('built', childPackagejson.name)
        await evaluatePackage({
          packageInformation: childInformation,
          childPackagejson,
          workspacePackageNames,
          builtPackageNames,
        })
      }
    }
  }
  builtPackageNames.push(packageJSON.name)
  await run({ dir: packageInformation.packageLocation })
}

export const sequential = async <A, B>(
  items: A[] | undefined,
  callback: (args: A, idx: number) => Promise<B>
) => {
  const accum: B[] = []
  if (!items) {
    return []
  }

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous
    // initial value will be undefined
    if (prev) {
      accum.push(prev)
    }

    return callback(endpoint, accum.length)
  }

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result)
  }

  return accum
}
