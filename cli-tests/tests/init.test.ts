import type {
  CLITestEnvironment,
  SpawnResult,
} from '@gmrchk/cli-testing-library/lib/types'
import { prepareEnvironment } from '@gmrchk/cli-testing-library'
import { promptHandler, TestParams } from './test-helpers'
import { makeGeneratedFilesList } from './generated-files'
import * as fs from 'fs'
import { Projects } from './projects'

const initRunner = process.env.INIT_RUNNER || 'npx'
const initArgs = process.env.INIT_ARGS || ''
const tinaVersion = process.env.TINAVERSION || 'latest'
const packageManager = process.env.PACKAGE_MANAGER || 'npm'
const starterFolder = process.env.STARTER_FOLDER || '/app'

describe('backend', () => {
  let env: CLITestEnvironment
  let spawn: (
    runner: string,
    command: string,
    runFrom?: string
  ) => Promise<SpawnResult>
  let cleanup: () => Promise<void>
  let path: string
  let failed: boolean
  beforeEach(async () => {
    env = await prepareEnvironment()
    console.log(`Preparing Test Environment at ${env.path} ...`)
    spawn = env.spawn
    cleanup = env.cleanup
    path = env.path
    failed = false

    // copy all the starters to the CLITestEnvironment
    for (const starter of fs.readdirSync(starterFolder)) {
      const { code, stdout, stderr } = await env.execute(
        'cp',
        `-r ${starterFolder}/${starter} ${path}`
      )

      if (code !== 0) {
        console.log(stderr)
      }

      expect(code).toBe(0)
    }

    console.log('Test Environment Ready')
  }, 60 * 1000)

  afterEach(async () => {
    if (failed) {
      console.log(`Test Environment Path: ${env.path}`)
    } else {
      if (cleanup) {
        await cleanup()
      }
    }
  }, 60 * 1000)

  it.each<TestParams>([
    {
      project: Projects['jekyll-ts'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['jekyll-js'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['hugo-ts'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['hugo-js'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['next-ts'],
      selfHosted: true,
      databaseAdapter: 'redis',
      skip: false,
    },
    {
      project: Projects['next-ts'],
      selfHosted: true,
      databaseAdapter: 'mongo',
      skip: false,
    },
    {
      project: Projects['next-ts'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['next-ts-app'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['next-ts-src'],
      selfHosted: true,
      databaseAdapter: 'redis',
      skip: false,
    },
    {
      project: Projects['next-js'],
      selfHosted: true,
      databaseAdapter: 'redis',
      skip: false,
    },
    {
      project: Projects['next-js'],
      selfHosted: true,
      databaseAdapter: 'mongo',
      skip: false,
    },
    {
      project: Projects['next-js'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['next-js-app'],
      selfHosted: false,
      skip: false,
    },
    {
      project: Projects['next-js-src'],
      selfHosted: true,
      databaseAdapter: 'redis',
      skip: false,
    },
  ])(
    '%o',
    async (params) => {
      console.table(params)
      if (params.skip) {
        console.warn(`skipping test`)
        return
      }
      const {
        project: {
          starter,
          typescript,
          framework,
          nextjsOptions: { srcDir = false, appDir = false } = {
            srcDir: false,
            appDir: false,
          },
        },
        selfHosted,
        databaseAdapter,
      } = params
      const starterPath = `${path}/${starter}`
      console.log(
        'spawning init...',
        initRunner,
        `${initArgs} @tinacms/cli@${tinaVersion} init --tinaVersion ${tinaVersion} from ${starterPath}`
      )
      let s = await spawn(
        initRunner,
        [
          initArgs,
          `@tinacms/cli@${tinaVersion}`,
          'init',
          '--tinaVersion',
          tinaVersion,
        ]
          .filter(Boolean)
          .join(' '),
        starter
      )
      s.debug()

      let p = promptHandler(s)

      await p.selectFramework(framework)
      await p.selectPackageManager(packageManager)
      await p.useTypescript(typescript)
      if (framework !== 'Next.js' && framework !== 'Hugo') {
        await p.setPublicFolder()
      }
      await p.waitForCompletion()

      console.log(
        'spawning init backend...',
        initRunner,
        `${initArgs} @tinacms/cli@${tinaVersion} init --tinaVersion ${tinaVersion} from ${starterPath}`
      )
      s = await spawn(
        initRunner,
        [
          initArgs,
          `@tinacms/cli@${tinaVersion}`,
          'init',
          'backend',
          '--tinaVersion',
          tinaVersion,
        ]
          .filter(Boolean)
          .join(' '),
        starter
      )

      p = promptHandler(s)

      s.debug()

      await p.selectFramework(framework)
      await p.selectPackageManager(packageManager)
      await p.selectSelfHost(selfHosted)
      if (selfHosted) {
        await p.githubProviderPrompts()

        await p.selectDatabaseAdapter(databaseAdapter)
        await p.setupNextAuth()
      } else {
        await p.setupTinaCloud()
      }

      await p.waitForCompletion(
        'Make sure  to push tina-lock.json to your GitHub repo'
      )

      const generatedFiles = makeGeneratedFilesList(framework, false, {
        selfHosted,
        databaseAdapter,
        nextJsAppDir: appDir,
      })
      console.log('Validating generated files...')
      for (const f of generatedFiles) {
        const path = `${starter}/${f.path({ typescript, src: srcDir })}`
        // expect path to exist
        try {
          expect(await env.exists(path)).toBeTruthy()
        } catch (e) {
          console.error(`File not found: ${path}`)
          failed = true
          throw e
        }
        // perform
        if (f.validate) {
          let error: string | undefined
          try {
            error = await f.validate(path, env, { selfHosted, databaseAdapter })
            expect(error).toBeUndefined()
          } catch (e) {
            console.error(`File validation failed: ${path}. Error: ${error}`)
            failed = true
            throw e
          }
        }
      }
    },
    10 * 60 * 1000
  )
})
