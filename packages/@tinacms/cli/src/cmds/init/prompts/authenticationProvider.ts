import prompts from 'prompts'
import crypto from 'crypto-js'

import type { PromptAuthenticationProvider, Config } from './types'
import type { Framework } from '../'
import { tinaCloudSetupQuestions } from './tinaCloudSetupQuestions'
const supportedAuthenticationProviders: {
  'tina-cloud': PromptAuthenticationProvider
  'next-auth': PromptAuthenticationProvider
  other: PromptAuthenticationProvider
} = {
  other: {
    name: 'other',
  },
  'tina-cloud': {
    configAuthenticationClass: '',
    backendAuthentication: 'TODO',
    name: 'tina-cloud',
  },
  'next-auth': {
    name: 'next-auth',
    configAuthenticationClass: `new UsernamePasswordAuthJSProvider()`,
    configImports: [
      {
        imported: ['UsernamePasswordAuthJSProvider'],
        from: 'tinacms-authjs/dist/tinacms',
      },
    ],
    backendAuthentication: `AuthJsBackendAuthentication({
          authOptions: TinaAuthJSOptions({
            databaseClient: databaseClient,
            secret: process.env.NEXTAUTH_SECRET,
          }),
        })`,
    backendAuthenticationImports: [
      {
        from: 'tinacms-authjs',
        imported: ['AuthJsBackendAuthentication', 'TinaAuthJSOptions'],
      },
    ],
  },
}

const authenticationProviderUpdateConfig: {
  [key in keyof typeof supportedAuthenticationProviders]: ({
    config,
  }: {
    config: Config
  }) => Promise<void>
} = {
  other: async () => {},
  'tina-cloud': async ({ config }) => {
    // TODO: Should this just call the AskTinaCLoudSetup function directly?
    const result = await prompts(tinaCloudSetupQuestions)
    config.envVars.push(
      {
        key: 'NEXT_PUBLIC_TINA_CLIENT_ID',
        value: result.clientId,
      },
      {
        key: 'NEXT_PUBLIC_TINA_CLIENT_SECRET',
        value: result.token,
      }
    )
  },
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
export const chooseAuthenticationProvider = async ({
  framework,
  config,
}: {
  config: Config
  framework: Framework
}) => {
  const choices = [
    {
      title: 'Tina Cloud for Auth',
      value: 'tina-cloud',
    },
  ]
  if (framework.name === 'next') {
    choices.push({
      value: 'next-auth',
      title: 'Next Auth (recommended)',
    })
  }
  choices.push({
    value: 'other',
    title: 'I will create my own authentication provider',
  })
  const authProviderChoice = await prompts([
    {
      name: 'authProvider',
      type: 'select',
      message: 'Which authentication provider are you using?',
      choices,
    },
  ])
  if (typeof authProviderChoice.authProvider === 'undefined') {
    throw new Error('Authentication provider is required')
  }
  const authProvider =
    supportedAuthenticationProviders[
      authProviderChoice.authProvider as 'tina-cloud' | 'next-auth' | 'other'
    ]

  await authenticationProviderUpdateConfig[authProviderChoice.authProvider]({
    config,
  })

  return authProvider
}
