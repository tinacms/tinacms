import prompts from 'prompts'
import crypto from 'crypto-js'

import type { PromptAuthProvider, Config } from './types'
import type { Framework } from '../'
import { askTinaCloudSetup } from './askTinaCloudSetup'
const supportedAuthProviders: {
  'tina-cloud': PromptAuthProvider
  'next-auth': PromptAuthProvider
  other: PromptAuthProvider
} = {
  other: {
    name: 'other',
  },
  'tina-cloud': {
    configAuthProviderClass: '',
    backendAuthProvider: 'TinaCloudBackendAuthProvider()',
    name: 'tina-cloud',
    backendAuthProviderImports: [
      {
        imported: ['TinaCloudBackendAuthProvider'],
        from: '@strivemath/tinacms-auth',
        packageName: '@strivemath/tinacms-auth',
      },
    ],
  },
  'next-auth': {
    name: 'next-auth',
    configAuthProviderClass: `new UsernamePasswordAuthJSProvider()`,
    configImports: [
      {
        imported: ['UsernamePasswordAuthJSProvider', 'TinaUserCollection'],
        from: '@strivemath/tinacms-authjs/dist/tinacms',
        packageName: 'tinacms-authjs',
      },
    ],
    extraTinaCollections: ['TinaUserCollection'],
    backendAuthProvider: `AuthJsBackendAuthProvider({
          authOptions: TinaAuthJSOptions({
            databaseClient: databaseClient,
            secret: process.env.NEXTAUTH_SECRET,
          }),
        })`,
    backendAuthProviderImports: [
      {
        from: 'tinacms-authjs',
        packageName: 'tinacms-authjs',
        imported: ['AuthJsBackendAuthProvider', 'TinaAuthJSOptions'],
      },
    ],
    peerDependencies: ['next-auth'],
  },
}

const authProviderUpdateConfig: {
  [key in keyof typeof supportedAuthProviders]: ({
    config,
  }: {
    config: Config
  }) => Promise<void>
} = {
  other: async () => {},
  'tina-cloud': askTinaCloudSetup,
  'next-auth': async ({ config }) => {
    const result = await prompts([
      {
        name: 'nextAuthSecret',
        type: 'text',
        message: `What is the NextAuth.js Secret? (Hit enter to use a randomly generated secret)`,
        initial:
          process.env.NEXTAUTH_SECRET ||
          crypto.lib.WordArray.random(16).toString(),
      },
    ])
    config.envVars.push({
      key: 'NEXTAUTH_SECRET',
      value: result.nextAuthSecret,
    })
  },
}
export const chooseAuthProvider = async ({
  framework,
  config,
}: {
  config: Config
  framework: Framework
}) => {
  // Could add this back in later if we want to support things other then next-auth in the init
  // {
  //   title: 'Tina Cloud for Auth',
  //   value: 'tina-cloud',
  // },
  // const choices = []
  // if (framework.name === 'next') {
  //   choices.push({
  //     value: 'next-auth',
  //     title: 'Next Auth (recommended)',
  //   })
  // }
  // choices.push({
  //   value: 'other',
  //   title: 'I will create my own auth provider',
  // })
  // const authProviderChoice = await prompts([
  //   {
  //     name: 'authProvider',
  //     type: 'select',
  //     message: 'Which auth provider are you using?',
  //     choices,
  //   },
  // ])
  // if (typeof authProviderChoice.authProvider === 'undefined') {
  //   throw new Error('Auth provider is required')
  // }
  // const authProvider =
  //   supportedAuthProviders[
  //     authProviderChoice.authProvider as 'tina-cloud' | 'next-auth' | 'other'
  //   ]

  // await authProviderUpdateConfig[authProviderChoice.authProvider]({
  //   config,
  // })
  const authProvider = supportedAuthProviders['next-auth']

  await authProviderUpdateConfig['next-auth']({
    config,
  })

  return authProvider
}
