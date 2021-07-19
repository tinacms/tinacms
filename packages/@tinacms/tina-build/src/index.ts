import { build } from 'esbuild'
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

    newCmd.on('--help', function() {
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
            Math.max(...command.subCommands.map(sub => sub.command.length)) +
            optionTag.length
          console.log(
            `${commandStr.padEnd(padLength)} ${subcommand.description}`
          )
        })
      }
      console.log('')
    })
    ;(command.options || []).forEach(option => {
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
  console.log('building for', packageDir)
  const packageJSON = JSON.parse(
    await fs.readFileSync(path.join(packageDir, 'package.json')).toString()
  )
  if (packageJSON.name === 'tina-build') {
    // Don't build yourself!
    return
  }
  // @ts-ignore
  const deps = packageJSON.dependencies
  // @ts-ignore
  const peerDeps = packageJSON.peerDependencies
  const external = Object.keys({ ...deps, ...peerDeps })

  const defaultBuildConfig = {
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    watch: args.watch
      ? {
          onRebuild(error, result) {
            if (error) console.error('Build failed:', error)
            else console.log(`Build success`)
          },
        }
      : false,
    external,
  }
  const buildConfig = packageJSON.buildConfig
    ? {
        ...defaultBuildConfig,
        ...packageJSON.buildConfig,
      }
    : defaultBuildConfig

  const successMessage = `${chalk.blue(`${packageJSON.name}`)} built in`
  console.time(successMessage)

  const result = await build({
    ...buildConfig,
    entryPoints: buildConfig.entryPoints.map(ep => {
      return path.join(process.cwd(), ep)
    }),
    outdir: path.join(process.cwd(), buildConfig.outdir),
  })

  await fs.writeFileSync(
    path.join(packageDir, 'dist', 'package.json'),
    JSON.stringify(
      {
        ...packageJSON,
        files: ['*'],
        main: 'index.js',
        types: 'index.d.ts',
      },
      null,
      2
    )
  )

  if (args.watch) {
    console.log('watching', packageJSON.name)
  }
  if (args.dir) {
    console.timeEnd(successMessage)
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
      action: options => run(options),
    },
  ])

  program.usage('command [options]')
  // error on unknown commands
  program.on('command:*', function() {
    console.error(
      'Invalid command: %s\nSee --help for a list of available commands.',
      args.join(' ')
    )
    process.exit(1)
  })

  program.on('--help', function() {
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
