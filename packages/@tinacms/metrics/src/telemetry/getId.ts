/**

*/

import { execSync } from 'child_process'

function _getProjectIdByGit() {
  try {
    const originBuffer = execSync(
      `git config --local --get remote.origin.url`,
      {
        timeout: 1000,
        stdio: `pipe`,
      }
    )

    return String(originBuffer).trim()
  } catch (_) {
    return null
  }
}

export function getID(): string {
  return _getProjectIdByGit() || process.env.REPOSITORY_URL || process.cwd()
}
