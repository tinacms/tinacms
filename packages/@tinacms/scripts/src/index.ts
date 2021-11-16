/**
Copyright 2021 Forestry.io Holdings, Inc.
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

import { build } from 'vite'
import { build as esbuild } from 'esbuild'
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'
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
    ['@tinacms/scripts', '@tinacms/webpack-helpers'].includes(packageJSON.name)
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
    throw new Error(e)
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

const buildIt = async (entryPoint, packageJSON) => {
  const entry = typeof entryPoint === 'string' ? entryPoint : entryPoint.name
  const target = typeof entryPoint === 'string' ? 'browser' : entryPoint.target
  const deps = packageJSON.dependencies
  // @ts-ignore
  const peerDeps = packageJSON.peerDependencies
  const external = Object.keys({ ...deps, ...peerDeps })
  const globals = {}

  external.forEach((ext) => (globals[ext] = 'NOOP'))
  if (target === 'node') {
    if (packageJSON.name === '@tinacms/graphql') {
      await esbuild({
        plugins: [pnpPlugin()],
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        // FIXME: no idea why but even though I'm on node14 it doesn't like
        // the syntax for optional chaining, should be supported on 14
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        target: 'node12',
        outdir: path.join(process.cwd(), 'dist'),
        external: external.filter(
          (item) =>
            !packageJSON.buildConfig.entryPoints[0].bundle.includes(item)
        ),
      })
    } else {
      await esbuild({
        plugins: [pnpPlugin()],
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        outdir: path.join(process.cwd(), 'dist'),
        external,
      })
    }

    const extension = path.extname(entry)

    // TODO: When we're building for real, swap this out
    await fs.writeFileSync(
      path.join(
        process.cwd(),
        'dist',
        entry.replace('src/', '').replace(extension, '.d.ts')
      ),
      `export * from "../${entry.replace(extension, '')}"`
    )

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
  const extension = path.extname(entry)
  await fs.writeFileSync(
    path.join(
      process.cwd(),
      'dist',
      entry.replace('src/', '').replace(extension, '.d.ts')
    ),
    `export * from "../${entry.replace(extension, '')}"`
  )
  return true
}

import pnp from 'pnpapi'
import chokidar from 'chokidar'

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
    chokidar
      .watch(workspacePkgs, {
        ignored: '**/spec/**/*', // ignore dotfiles
      })
      .on('change', async (path) => {
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
        return stdout.includes('packages')
      })
      .map((line) => line.split(' ').pop())

    await sequential(packagePathsToBuild, async (packagePath) => {
      await run({ dir: packagePath })
    })
  }
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
