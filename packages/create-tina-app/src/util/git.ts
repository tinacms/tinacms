/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
