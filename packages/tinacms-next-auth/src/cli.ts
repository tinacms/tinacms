import 'isomorphic-fetch'

//@ts-ignore
import { version } from '../package.json'

import { Cli, Builtins, Command } from 'clipanion'
import chalk from 'chalk'
import dotenv from 'dotenv'
import fs from 'fs'
import prompts from 'prompts'

import { RedisUserStore } from './redis-user-store'
import { UserStore } from './types'

const CHOICES = {
  ADD: { title: 'Add a user', value: 'ADD' },
  UPDATE: { title: "Update a user's password", value: 'UPDATE' },
  DELETE: { title: 'Delete a user', value: 'DELETE' },
  EXIT: { title: 'Exit', value: 'EXIT' },
}

const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}

const defaultUsersKey = 'tinacms_users'

const promptUserForToken = async () => {
  console.log('Did not find KV store url and token in .env file.')
  // Prompt user for KV store url and token
  const answers = await prompts([
    {
      type: () => (process.env.KV_REST_API_URL ? null : 'text'),
      name: 'url',
      message: `Enter your Vercel KV Database URL (see https://vercel.com/dashboard/stores):`,
    },
    {
      name: 'token',
      message: `Enter your Vercel KV Database token:`,
      type: () => (process.env.KV_REST_API_TOKEN ? null : 'text'),
    },
  ])

  if (answers.url && !process.env.KV_REST_API_URL) {
    fs.writeFileSync('.env', `KV_REST_API_URL=${answers.url}\n`, { flag: 'a' })
    process.env.KV_REST_API_URL = answers.url
  }
  if (answers.token && !process.env.KV_REST_API_TOKEN) {
    fs.writeFileSync('.env', `KV_REST_API_TOKEN=${answers.token}\n`, {
      flag: 'a',
    })
    process.env.KV_REST_API_TOKEN = answers.token
  }
  // don't bother asking about this one, but generate it to show that it's configurable for the
  // rare case
  if (!process.env.NEXTAUTH_CREDENTIALS_KEY) {
    fs.writeFileSync('.env', `NEXTAUTH_CREDENTIALS_KEY=${defaultUsersKey}\n`, {
      flag: 'a',
    })
    process.env.NEXTAUTH_CREDENTIALS_KEY = defaultUsersKey
  }
}

const addUser = async (
  name: string,
  password: string,
  passwordConfirm: string,
  userStore: UserStore
) => {
  if (password !== passwordConfirm) {
    console.log(chalk.red('Passwords do not match!'))
    process.exit(1)
  }
  if (await userStore.addUser(name, password)) {
    console.log(chalk.green(`User ${name} added!`))
  } else {
    console.log(chalk.red(`Error adding user ${name}!`))
  }
}

export const updatePassword = async (
  name: string,
  password: string,
  passwordConfirm: string,
  userStore: UserStore
) => {
  if (password !== passwordConfirm) {
    console.log(chalk.red('Passwords do not match!'))
    process.exit(1)
  }
  if (await userStore.updatePassword(name, password)) {
    console.log(chalk.green(`User ${name} password updated!`))
  } else {
    console.log(chalk.red(`Error updating user ${name} password!`))
  }
}

export const deleteUser = async (name: string, userStore: UserStore) => {
  if (await userStore.deleteUser(name)) {
    console.log(chalk.green(`User ${name} deleted!`))
  } else {
    console.log(chalk.red(`Error deleting user ${name}!`))
  }
}

class SetupCommand extends Command {
  static paths = [['setup']]
  static usage = Command.Usage({
    category: `Commands`,
    description: `Configure TinaCMS Users`,
    examples: [[`A basic example`, `$0 setup`]],
  })

  async execute(): Promise<number | void> {
    await fs.promises.stat('.env').catch(async (_) => {
      await fs.promises
        .stat('.env.example')
        .then(async (_) => {
          fs.copyFileSync('.env.example', '.env')
        })
        .catch(async (_) => {
          console.log(chalk.red('No .env file found!'))
          process.exit(1)
        })
    })
    dotenv.config()

    console.log(chalk.green('Welcome to TinaCMS!'))

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      try {
        await promptUserForToken()
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
          throw new Error('Missing KV store url or token!')
        }
        // Check to make sure they have to correct format
        if (!isValidUrl(process.env.KV_REST_API_URL)) {
          throw new Error('Invalid KV store url!')
        }
        if (typeof process.env.KV_REST_API_TOKEN !== 'string') {
          throw new Error('Invalid KV_REST_API_TOKEN! Must be a string.')
        }
      } catch (e) {
        console.log(
          chalk.red(
            'Error: Could not setup process.env.KV_REST_API_URL or process.env.KV_REST_API_TOKEN'
          )
        )
        console.log(e.message)
        process.exit(1)
      }
    }

    let done = false
    let userStore: RedisUserStore
    try {
      userStore = new RedisUserStore(
        process.env.NEXTAUTH_CREDENTIALS_KEY || defaultUsersKey,
        {
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        }
      )
      await userStore.isInitialized()
    } catch (e) {
      console.error(
        chalk.red(
          'Error: Could not connect to KV store! Please check credentials in your .env file.\nEx:\n\nKV_REST_API_URL="https://<Something>.kv.vercel-storage.com"\nKV_REST_API_TOKEN=***\nNEXTAUTH_CREDENTIALS_KEY=tinacms_users'
        )
      )
      console.error(e)
      process.exit(1)
    }
    console.log(chalk.green('Connected to KV store!'))

    // Loop until user exits
    while (!done) {
      const users = await userStore.getUsers()

      if (!users?.length) {
        console.log(chalk.red('No users found! Please add a user.'))
      } else {
        console.log(chalk.green('Users:'))
        console.table(
          users.map((user) => {
            return {
              name: user.name,
            }
          })
        )
      }

      const answers = await prompts(
        [
          {
            type: 'select',
            name: 'choice',
            message: `What would you like to do?`,
            choices: [
              CHOICES.ADD,
              CHOICES.UPDATE,
              CHOICES.DELETE,
              CHOICES.EXIT,
            ],
          },
          {
            type: (_, answers) =>
              answers.choice === 'ADD' ||
              answers.choice === 'UPDATE' ||
              answers.choice === 'DELETE'
                ? 'text'
                : null,
            name: 'name',
            validate: (value) => {
              // username must only contain alphanumeric characters
              if (!/^[a-z0-9]+$/i.test(value)) {
                return 'Username must only contain alphanumeric characters'
              }
              return true
            },
            message: `Enter a username:`,
          },
          {
            type: (_, answers) =>
              answers.choice === 'ADD' || answers.choice === 'UPDATE'
                ? 'password'
                : null,
            name: 'password',
            message: `Enter a user password:`,
          },
          {
            type: (_, answers) =>
              answers.choice === 'ADD' || answers.choice === 'UPDATE'
                ? 'password'
                : null,
            name: 'passwordConfirm',
            message: `Confirm the user password:`,
          },
        ],
        {
          onCancel: async () => {
            // If the click Control C, exit the process
            console.log(chalk.green('Goodbye!'))
            process.exit(0)
          },
        }
      )

      if (answers.choice === 'ADD') {
        const { name, password, passwordConfirm } = answers
        try {
          await addUser(name, password, passwordConfirm, userStore)
        } catch (e) {
          console.log(
            chalk.red(
              `An unexpected error occurred while adding a user. ${e.message}}`
            )
          )
        }
      } else if (answers.choice === 'UPDATE') {
        const { name, password, passwordConfirm } = answers
        try {
          await updatePassword(name, password, passwordConfirm, userStore)
        } catch (e) {
          console.log(
            chalk.red(
              `An unexpected error occurred while adding a updating the password for ${name}. ${e.message}}`
            )
          )
        }
      } else if (answers.choice === 'DELETE') {
        const { name } = answers
        try {
          await deleteUser(name, userStore)
        } catch (e) {
          console.log(
            chalk.red(
              `An unexpected error occurred while deleting the user ${name}. ${e.message}}`
            )
          )
        }
      } else if (answers.choice === 'EXIT') {
        done = true
      }
    }
  }
}

const cli = new Cli({
  binaryName: `tinacms-next-auth`,
  binaryLabel: `TinaCMS NextAuth`,
  binaryVersion: version,
})
cli.error((err) => {
  // check to see if user clicked CTRL+C
  if (err.message === 'SIGINT') {
    console.log(chalk.red('Exiting...'))
    process.exit(1)
  }
  console.log(chalk.red(err.message))
  console.log(err)
  process.exit(1)
})

cli.register(SetupCommand)
cli.register(Builtins.DefinitionsCommand)
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)

export default cli
