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

import { readFileSync } from 'fs-extra'
import { execSync } from 'child_process'
import { join } from 'path'

function _executeCommand(cmd: string) {
  try {
    const originBuffer = execSync(cmd, {
      timeout: 1000,
      stdio: `pipe`,
    })

    return String(originBuffer).trim()
  } catch (_) {
    return null
  }
}
const _getPack = (rootDir: string) => {
  let pack: any = {}
  try {
    const rawJSON: string = readFileSync(
      join(rootDir, 'package.json')
    ).toString()
    pack = JSON.parse(rawJSON)
  } catch (_e) {}
  return pack
}

export const getTinaVersion = () => {
  const pack = _getPack(process.cwd())
  const version = pack?.dependencies?.tinacms
  return version || ''
}

export const getTinaCliVersion = () => {
  const pack = _getPack(process.cwd())
  const version =
    pack?.devDependencies?.['@tinacms/cli'] ||
    pack?.dependencies?.['@tinacms/cli']
  return version || ''
}

export const getYarnVersion = () => {
  return _executeCommand('yarn -v') || ''
}

export const getNpmVersion = () => {
  return _executeCommand('npm -v') || ''
}
