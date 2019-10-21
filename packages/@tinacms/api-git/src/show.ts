import * as fs from 'fs'
import * as path from 'path'
import { openRepo } from './open-repo'

export interface ShowConfig {
  pathRoot: string
  fileRelativePath: string
}

export async function show({ pathRoot, fileRelativePath }: ShowConfig) {
  let repo = openRepo(pathRoot)

  try {
    return await repo.show([`HEAD:${fileRelativePath}`])
  } catch (e) {
    return fs.readFileSync(path.join(pathRoot, fileRelativePath), 'utf8')
  }
}
