/**

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
