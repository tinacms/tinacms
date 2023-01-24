import { createDatabase } from '@tinacms/graphql'
import { FilesystemBridge } from '@tinacms/datalayer'
import { TinaLevelClient } from '@tinacms/cli'
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import { Base64 } from 'js-base64'

const isLocal = process.env.TINA_IS_LOCAL === 'true'

const owner = 'test'
const repo = 'test'
const token = 'test'
const branch = 'test'

const octokit = new Octokit({
  auth: token,
})

const localLevelStore = new TinaLevelClient()

const githubOnPut = async (key, value) => {
  let sha
  try {
    const {
      data: { sha: existingSha },
    } = await octokit.repos.getContent({
      owner,
      repo,
      path: key,
      branch,
    })
    sha = existingSha
  } catch (e) {}

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: key,
    message: 'commit from self-hosted tina',
    content: Base64.encode(value),
    branch,
    sha,
  })
}
const localOnPut = async (key, value) => {
  const filePath = path.join(process.cwd(), key)
  fs.writeFileSync(filePath, value)
}
const githubOnDelete = async (key) => {
  console.log('deleting', key)
  let sha
  try {
    const {
      data: { sha: existingSha },
    } = await octokit.repos.getContent({
      owner,
      repo,
      path: key,
      branch,
    })
    sha = existingSha
  } catch (e) {
    console.log(e)
  }
  if (sha) {
    const { data } = await octokit.repos.deleteFile({
      owner,
      repo,
      path: key,
      message: 'commit from self-hosted tina',
      branch,
      sha,
    })
    console.log('data', data)
  }
}
const localOnDelete = async (key) => {
  const filePath = path.join(process.cwd(), key)
  fs.rmSync(filePath)
}

export default createDatabase({
  bridge: new FilesystemBridge(process.cwd()),
  // undefined could be replaced with a MongoLevelStore in production
  level: isLocal ? localLevelStore : undefined,
  onPut: isLocal ? localOnPut : githubOnPut,
  onDelete: isLocal ? localOnDelete : githubOnDelete,
})
