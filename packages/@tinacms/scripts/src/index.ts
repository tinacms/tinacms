/**

*/

import { build } from 'vite'
import { build as esbuild } from 'esbuild'
import fs from 'fs-extra'
import path from 'node:path'
import chokidar from 'chokidar'
import { exec } from 'node:child_process'
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

const deepMerge = (target, source) => {
  for (const key in source) {
    if (!source.hasOwnProperty(key) || key === '__proto__' || key === 'constructor') continue;
    if (
      source[key] instanceof Object &&
      !Array.isArray(source[key]) &&
      target.hasOwnProperty(key)
    ) {
      // If both target and source have the same key and it's an object, merge them recursively
      target[key] = deepMerge(target[key], source[key])
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      // If both target and source have the same key and it's an array, concatenate them
      target[key] = [...new Set([...target[key], ...source[key]])] // Merging arrays and removing duplicates
    } else if (Array.isArray(source[key])) {
      // If source has an array and target doesn't, use the source array
      target[key] = [...source[key]]
    } else {
      // Otherwise, take the value from the source
      target[key] = source[key]
    }
  }
  return target
}

const program = new commander.Command('Tina Build')
const registerCommands = (commands: Command[], noHelp = false) => {
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

    newCmd.on('--help', () => {
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

const watch = () => {
  exec('pnpm list -r --json', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }

    const json = JSON.parse(stdout) as { name: string; path: string }[]
    const watchPaths = []

    json.forEach((pkg) => {
      if (pkg.path.includes(path.join('packages', ''))) {
        watchPaths.push(pkg.path)
      }
    })

    chokidar
      .watch(
        watchPaths.map((p) => path.join(p, 'src', '**/*')),
        { ignored: ['**/spec/**/*', 'node_modules'] }
      )
      .on('change', async (path) => {
        const changedPackagePath = watchPaths.find((p) => path.startsWith(p))
        await run({ dir: changedPackagePath })
      })
  })
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
      command: 'watch',
      description: 'Watch',
      action: () => watch(),
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

export const buildIt = async (entryPoint, packageJSON) => {
  const entry = typeof entryPoint === 'string' ? entryPoint : entryPoint.name
  const target = typeof entryPoint === 'string' ? 'browser' : entryPoint.target
  const deps = packageJSON.dependencies
  // @ts-ignore
  const peerDeps = packageJSON.peerDependencies
  const external = Object.keys({ ...deps, ...peerDeps })
  const globals = {}

  const out = (entry: string) => {
    const { dir, name } = path.parse(entry)
    const outdir = dir.replace('src', 'dist')
    const outfile = name
    const relativeOutfile = path.join(
      outdir
        .split('/')
        .map(() => '..')
        .join('/'),
      dir,
      name
    )
    return { outdir, outfile, relativeOutfile }
  }

  const outInfo = out(entry)

  if (['@tinacms/app'].includes(packageJSON.name)) {
    console.log('skipping @tinacms/app')
    return
  }

  external.forEach((ext) => (globals[ext] = 'NOOP'))
  if (target === 'node') {
    if (['@tinacms/graphql', '@tinacms/datalayer'].includes(packageJSON.name)) {
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        // FIXME: no idea why but even though I'm on node14 it doesn't like
        // the syntax for optional chaining, should be supported on 14
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        target: 'node12',
        // Use the outfile if it is provided
        outfile: outInfo.outfile
          ? path.join(process.cwd(), 'dist', `${outInfo.outfile}.js`)
          : path.join(process.cwd(), 'dist', 'index.js'),
        external: external.filter(
          (item) =>
            !packageJSON.buildConfig.entryPoints[0].bundle.includes(item)
        ),
      })
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        target: 'es2020',
        format: 'esm',
        outfile: outInfo.outfile
          ? path.join(process.cwd(), 'dist', `${outInfo.outfile}.mjs`)
          : path.join(process.cwd(), 'dist', 'index.mjs'),
        external,
      })
    } else if (['@tinacms/mdx'].includes(packageJSON.name)) {
      const peerDeps = packageJSON.peerDependencies
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        // FIXME: no idea why but even though I'm on node14 it doesn't like
        // the syntax for optional chaining, should be supported on 14
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        target: 'node12',
        format: 'cjs',
        outfile: path.join(process.cwd(), 'dist', 'index.js'),
        external: Object.keys({ ...peerDeps }),
      })
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        target: 'es2020',
        format: 'esm',
        outfile: path.join(process.cwd(), 'dist', 'index.mjs'),
        // Bundle dependencies, the remark ecosystem only publishes ES modules
        // and includes "development" export maps which actually throw errors during
        // development, which we don't want to expose our users to.
        external: Object.keys({ ...peerDeps }),
      })
      // The ES version is targeting the browser, this is used by the rich-text's raw mode
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'browser',
        target: 'es2020',
        format: 'esm',
        outfile: path.join(process.cwd(), 'dist', 'index.browser.mjs'),
        // Bundle dependencies, the remark ecosystem only publishes ES modules
        // and includes "development" export maps which actually throw errors during
        // development, which we don't want to expose our users to.
        external: Object.keys({ ...peerDeps }),
      })
      // Additional bundle to target edge runtimes:
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        conditions: ['worker'],
        target: 'es2020',
        format: 'esm',
        outfile: path.join(process.cwd(), 'dist', 'index.edge.mjs'),
      })
    } else {
      await esbuild({
        entryPoints: [path.join(process.cwd(), entry)],
        bundle: true,
        platform: 'node',
        outfile: path.join(process.cwd(), 'dist', `${outInfo.outfile}.js`),
        external,
        target: 'node12',
      })
      if (packageJSON.module) {
        await esbuild({
          entryPoints: [path.join(process.cwd(), entry)],
          bundle: true,
          platform: 'node',
          target: 'es2020',
          format: 'esm',
          outfile: outInfo.outfile
            ? path.join(process.cwd(), 'dist', `${outInfo.outfile}.mjs`)
            : path.join(process.cwd(), 'dist', 'index.mjs'),
          external,
        })
      }
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
    resolve: {
      alias: {
        '@toolkit': path.resolve(process.cwd(), 'src/toolkit'),
        '@tinacms/toolkit': path.resolve(process.cwd(), 'src/toolkit/index.ts'),
      },
    },
    build: {
      minify: false,
      assetsInlineLimit: 0,
      lib: {
        entry: path.resolve(process.cwd(), entry),
        name: packageJSON.name,
        fileName: (format) => {
          return format === 'umd'
            ? `${outInfo.outfile}.js`
            : `${outInfo.outfile}.mjs`
        },
      },
      outDir: outInfo.outdir,
      emptyOutDir: false, // we build multiple files in to the dir
      sourcemap: false, // true | 'inline' (note: inline will go straight into your bundle size)
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }
          warn(warning)
        },
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
    ? deepMerge(defaultBuildConfig, packageJSON.buildConfig)
    : defaultBuildConfig

  await build({
    ...buildConfig,
  })
  await fs.outputFileSync(
    path.join(outInfo.outdir, `${outInfo.outfile}.d.ts`),
    `export * from "${outInfo.relativeOutfile}"`
  )
  return true
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
