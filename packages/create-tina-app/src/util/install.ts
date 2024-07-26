import chalk from 'chalk'
import spawn from 'cross-spawn'

interface InstallArgs {
  /**
   * The package manager to use (yarn, npm, pnpm).
   */
  packageManager: 'yarn' | 'npm' | 'pnpm'
  /**
   * Indicate whether there is an active Internet connection.
   */
  isOnline: boolean
  /**
   * Indicate whether the given dependencies are devDependencies.
   */
  devDependencies?: boolean
}

/**
 * Spawn a package manager installation with Yarn, NPM, or PNPM.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export function install(
  root: string,
  dependencies: string[] | null,
  { packageManager, isOnline, devDependencies }: InstallArgs
): Promise<void> {
  /**
   * Package manager-specific command-line flags.
   */
  const npmFlags: string[] = []
  const yarnFlags: string[] = []
  const pnpmFlags: string[] = []

  /**
   * Return a Promise that resolves once the installation is finished.
   */
  return new Promise((resolve, reject) => {
    let args: string[]
    const command: string = packageManager

    if (dependencies?.length) {
      /**
       * If there are dependencies, run a variation of `{packageManager} add`.
       */
      switch (packageManager) {
        case 'yarn':
          /**
           * Call `yarn add --exact (--offline)? (-D)? ...`.
           */
          args = ['add', '--exact']
          if (!isOnline) args.push('--offline')
          args.push('--cwd', root)
          if (devDependencies) args.push('--dev')
          args.push(...dependencies)
          break
        case 'npm':
          /**
           * Call `npm install [--save|--save-dev] ...`.
           */
          args = ['install', '--save-exact']
          args.push(devDependencies ? '--save-dev' : '--save')
          args.push(...dependencies)
          break
        case 'pnpm':
          /**
           * Call `pnpm add (--offline)? (-D)? ...`.
           */
          args = ['add']
          if (!isOnline) args.push('--offline')
          args.push('--save-exact')
          if (devDependencies) args.push('-D')
          args.push(...dependencies)
          break
      }
    } else {
      /**
       * If there are no dependencies, run a variation of `{packageManager} install`.
       */
      args = ['install']
      if (!isOnline) {
        console.log(chalk.yellow('You appear to be offline.'))
        if (packageManager === 'yarn') {
          console.log(chalk.yellow('Falling back to the local Yarn cache.'))
          args.push('--offline')
        } else {
          console.log()
        }
      }
    }
    /**
     * Add any package manager-specific flags.
     */
    switch (packageManager) {
      case 'yarn':
        args.push(...yarnFlags)
        break
      case 'npm':
        args.push(...npmFlags)
        break
      case 'pnpm':
        args.push(...pnpmFlags)
        break
    }
    /**
     * Spawn the installation process.
     */
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1' },
    })
    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}` })
        return
      }
      resolve()
    })
  })
}
