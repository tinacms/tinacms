/**

*/

import { execSync } from 'child_process'
import path from 'path'
import rimraf from 'rimraf'
import fs from 'fs-extra'
import chalk from 'chalk'

function isInGitRepository(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })
    return true
  } catch (_) {}
  return false
}

function isInMercurialRepository(): boolean {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' })
    return true
  } catch (_) {}
  return false
}

export function tryGitInit(root: string): boolean {
  let didInit = false
  try {
    execSync('git --version', { stdio: 'ignore' })
    if (isInGitRepository() || isInMercurialRepository()) {
      return false
    }
    if (!fs.existsSync('.gitignore')) {
      console.warn(
        chalk.yellow(
          'There is no .gitignore file in this repository, creating one...'
        )
      )
      fs.writeFileSync(
        '.gitignore',
        `node_modules
.yarn/*
.DS_Store
.cache
.next/
`
      )
    }

    execSync('git init', { stdio: 'ignore' })
    didInit = true

    execSync('git checkout -b main', { stdio: 'ignore' })

    execSync('git add -A', { stdio: 'ignore' })
    execSync('git commit -m "Initial commit from Create Tina App"', {
      stdio: 'ignore',
    })
    return true
  } catch (e) {
    if (didInit) {
      try {
        rimraf.sync(path.join(root, '.git'))
      } catch (_) {}
    }
    return false
  }
}
