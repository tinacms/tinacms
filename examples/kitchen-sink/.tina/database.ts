import { createDatabase } from '@tinacms/graphql'
import { FilesystemBridge } from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'
import { config } from 'dotenv'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'

const owner = process.env.GITHUB_OWNER
const repo = process.env.GITHUB_REPO
const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
const branch = process.env.GITHUB_BRANCH

const octokit = new Octokit({
  auth: token,
})

const onPut = async (key, value) => {
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
const onDelete = async (key) => {
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

config()

const level = new MongodbLevel({
  mongoUri: process.env.MONGO_URI,
  dbName: 'tinacms',
  collectionName: 'tinacms',
})

export default createDatabase({
  bridge: new FilesystemBridge(process.cwd()),
  level,
  onPut,
  onDelete,
})
