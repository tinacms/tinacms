import { CLITestEnvironment } from '@gmrchk/cli-testing-library/lib/types'
import { loadFile } from './test-helpers'

export type FrameworkType = 'Next.js' | 'Hugo' | 'Jekyll' | 'Other'
export type DatabaseAdapterType = 'redis' | 'mongo'
const packageManager = process.env.PACKAGE_MANAGER || 'npm'

export type InitOptions = {
  selfHosted?: boolean
  databaseAdapter?: DatabaseAdapterType
  nextJsAppDir?: boolean
}

export type GeneratedFileOptions = {
  typescript?: boolean
  src?: boolean
}

export type GeneratedFileType = {
  path: (opts?: GeneratedFileOptions) => string
  validate?: (
    path: string,
    env: CLITestEnvironment,
    opts?: InitOptions
  ) => Promise<string | undefined>
}

const helloWorldPost: GeneratedFileType = {
  path: () => 'content/posts/hello-world.md',
}
const reactiveExample: GeneratedFileType = {
  path: ({ typescript, src }) =>
    `${src ? 'src/' : ''}pages/demo/blog/[filename].${
      typescript ? 'tsx' : 'js'
    }`,
}

const databaseTs: GeneratedFileType = {
  path: ({ typescript }) => `tina/database.${typescript ? 'ts' : 'js'}`,
  validate: async (
    path: string,
    env: CLITestEnvironment,
    opts?: InitOptions
  ) => {
    const content = await loadFile(path, env)
    if (opts?.databaseAdapter === 'redis') {
      if (content.indexOf('@upstash/redis') === -1) {
        return 'databaseAdapter configured with upstash-redis but missing @upstash/redis import'
      }
      if (content.indexOf('upstash-redis-level') === -1) {
        return 'databaseAdapter configured with upstash-redis but missing upstash-redis-level import'
      }
    } else if (opts?.databaseAdapter === 'mongo') {
      if (content.indexOf('mongodb-level') === -1) {
        return 'databaseAdapter configured with mongodb but missing mongodb-level import'
      }
    }
  },
}

const apiHandler: GeneratedFileType = {
  path: ({ typescript, src }) =>
    `${src ? 'src/' : ''}pages/api/tina/[...routes].${
      typescript ? 'ts' : 'js'
    }`,
}

const tinaConfig: GeneratedFileType = {
  path: ({ typescript }) => `tina/config.${typescript ? 'ts' : 'js'}`,
  validate: async (
    path: string,
    env: CLITestEnvironment,
    opts?: InitOptions
  ) => {
    const content = await loadFile(path, env)
    if (opts?.selfHosted) {
      if (content.indexOf('contentApiUrlOverride') === -1) {
        return 'self-hosted config missing contentApiUrlOverride'
      }
    } else {
      if (content.indexOf('contentApiUrlOverride') !== -1) {
        return 'cloud config contains contentApiUrlOverride'
      }
      if (content.indexOf('clientId') === -1) {
        return 'cloud config missing clientId'
      }
      if (content.indexOf('token') === -1) {
        return 'cloud config missing token'
      }
    }
  },
}

const packageJson: GeneratedFileType = {
  path: () => 'package.json',
  validate: async (
    path: string,
    env: CLITestEnvironment,
    opts?: InitOptions
  ) => {
    const content = JSON.parse(await loadFile(path, env))
    const dependencies = Object.keys(content.dependencies)
    const devDependencies = Object.keys(content.devDependencies)
    const scripts = Object.keys(content.scripts)
    if (!devDependencies.includes('@tinacms/cli')) {
      return 'missing @tinacms/cli dependency'
    }
    if (!dependencies.includes('tinacms')) {
      return 'missing tinacms dependency'
    }
    if (opts?.selfHosted) {
      if (opts?.databaseAdapter === 'redis') {
        if (!dependencies.includes('@upstash/redis')) {
          return 'missing @upstash/redis dependency'
        }
        if (!dependencies.includes('upstash-redis-level')) {
          return 'missing upstash-redis-level dependency'
        }
      } else if (opts?.databaseAdapter === 'mongo') {
        if (!dependencies.includes('mongodb-level')) {
          return 'missing mongodb-level dependency'
        }
      }
      if (!dependencies.includes('@tinacms/datalayer')) {
        return 'missing @tinacms/datalayer dependency'
      }
      if (!dependencies.includes('tinacms-gitprovider-github')) {
        return 'missing tinacms-gitprovider-github dependency'
      }
      if (!dependencies.includes('next-auth')) {
        return 'missing next-auth dependency'
      }
      if (!dependencies.includes('tinacms-authjs')) {
        return 'missing tinacms-next-auth dependency'
      }
    }
  },
}

const gitIgnore: GeneratedFileType = {
  path: () => '.gitignore',
  validate: async (
    path: string,
    env: CLITestEnvironment,
    opts?: InitOptions
  ) => {
    const content = await loadFile(path, env)
    if (content.indexOf('node_modules') === -1) {
      return '.gitignore missing node_modules'
    }
    if (content.indexOf('.env') === -1) {
      return '.gitignore missing .env'
    }
  },
}

const lockFile: GeneratedFileType = {
  path: () => {
    if (packageManager === 'yarn') {
      return 'yarn.lock'
    } else if (packageManager === 'pnpm') {
      return 'pnpm-lock.yaml'
    } else {
      return 'package-lock.json'
    }
  },
}

export const makeGeneratedFilesList = (
  framework: FrameworkType,
  initOnly: boolean,
  opts?: InitOptions
) => {
  if (framework === 'Next.js') {
    const nextJsBase = [
      packageJson,
      lockFile,
      gitIgnore,
      helloWorldPost,
      tinaConfig,
    ]
    if (!opts?.nextJsAppDir) {
      nextJsBase.push(reactiveExample)
    }
    if (initOnly) {
      return nextJsBase
    } else {
      const result = [...nextJsBase]
      if (opts?.selfHosted) {
        result.push(databaseTs)
        result.push(apiHandler)
      }
      return result
    }
  } else if (
    framework === 'Hugo' ||
    framework === 'Jekyll' ||
    framework === 'Other'
  ) {
    return [packageJson, lockFile, gitIgnore, helloWorldPost, tinaConfig]
  }
}
