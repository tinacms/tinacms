import { execSync } from 'child_process'
import path from 'path'
import { log } from './logger'
import fs from 'fs-extra'

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

export function makeFirstCommit(root: string) {
  try {
    execSync('git checkout -b main', { stdio: 'ignore' })

    execSync('git add -A', { stdio: 'ignore' })
    execSync('git commit -m "Initial commit from Create Tina App"', {
      stdio: 'ignore',
    })
  } catch (err) {
    fs.removeSync(path.join(root, '.git'))
    throw err
  }
}

export function initializeGit(): boolean {
  execSync('git --version', { stdio: 'ignore' })

  if (isInGitRepository() || isInMercurialRepository()) {
    log.warn('Already in a Git repository, skipping.')
    return false
  }

  if (!fs.existsSync('.gitignore')) {
    log.warn('There is no .gitignore file in this repository, creating one...')
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

  return true
}
