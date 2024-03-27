import {
  CLITestEnvironment,
  SpawnResult,
} from '@gmrchk/cli-testing-library/lib/types'
import { Project } from './projects'
import { DatabaseAdapterType } from './generated-files'

export type TestParams = {
  project: Project
  selfHosted: boolean
  databaseAdapter?: DatabaseAdapterType
  skip?: boolean
}

export const promptHandler = (spawn: SpawnResult) => {
  const { getExitCode, waitForFinish, waitForText, writeText, pressKey } = spawn
  const self = {
    selectPackageManager: async (packageManager: string) => {
      await waitForText('Choose your package manager')
      if (packageManager === 'yarn') {
        await pressKey('arrowDown')
      } else if (packageManager === 'npm') {
        await pressKey('arrowDown')
        await pressKey('arrowDown')
      }
      await pressKey('enter')
    },
    selectFramework: async (
      framework: 'Next.js' | 'Hugo' | 'Jekyll' | 'Other'
    ): Promise<void> => {
      await waitForText('What framework are you using?')
      if (framework === 'Hugo') {
        await pressKey('arrowDown')
      } else if (framework === 'Jekyll') {
        await pressKey('arrowDown')
        await pressKey('arrowDown')
      } else if (framework !== 'Next.js') {
        await pressKey('arrowDown')
        await pressKey('arrowDown')
        await pressKey('arrowDown')
      }
      await pressKey('enter')
    },
    selectSelfHost: async (selfHosted: boolean) => {
      await waitForText(
        'Do you want to host your project on Tina Cloud or self-host?'
      )
      if (selfHosted) {
        await pressKey('arrowDown')
      }
      await pressKey('enter')
    },
    acceptDefault: async (waitText: string) => {
      await waitForText(waitText)
      await pressKey('enter')
    },
    useTypescript: async (typescript: boolean) => {
      await waitForText('Would you like to use Typescript')
      await writeText(typescript ? 'Y' : 'N')
      await pressKey('enter')
    },
    waitForCompletion: async (
      completionText: string = 'has been initialized!'
    ) => {
      console.log(`Waiting for "${completionText}" and completion...`)
      await waitForText(completionText)
      await waitForFinish()
      expect(getExitCode()).toBe(0)
      console.log('Finished!')
    },
    githubProviderPrompts: async () => {
      await self.acceptDefault('What is your GitHub Personal Access Token?')
      await self.acceptDefault(
        'What is your GitHub Owner (Your Github Username)?'
      )
      await self.acceptDefault('What is your GitHub Repo name?')
    },
    selectDatabaseAdapter: async (adapterType: 'redis' | 'mongo') => {
      console.log({ adapterType })
      await waitForText('Select a self-hosted Database Adapter')
      if (adapterType === 'redis') {
        console.log('should press enter...')
        await pressKey('enter')
        await self.acceptDefault('What is the KV (Redis) Rest API URL?')
        await self.acceptDefault('What is the KV (Redis) Rest API Token?')
      } else if (adapterType === 'mongo') {
        await pressKey('arrowDown')
        await pressKey('enter')
        await self.acceptDefault('What is the MongoDB URI')
      }
    },
    setupNextAuth: async () => {
      await self.acceptDefault('What is the NextAuth.js Secret?')
    },
    setupTinaCloud: async () => {
      await self.acceptDefault('What is your Tina Cloud Client ID?')
      await self.acceptDefault('What is your Tina Cloud Read Only Token?')
    },
    setPublicFolder: async () => {
      await self.acceptDefault('Where are public assets stored?')
    },
  }

  return self
}

export const loadFile = async (path: string, env: CLITestEnvironment) => {
  const { code, stdout, stderr } = await env.execute('cat', `${path}`)
  if (code !== 0) {
    console.log(stderr)
  }
  return stdout.join('\n')
}
