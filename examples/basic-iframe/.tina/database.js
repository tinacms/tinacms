import { createDatabase } from '@tinacms/graphql'
import { TinaLevelClient } from '@tinacms/cli'
import { MongodbLevel } from 'mongodb-level'
import { Octokit } from '@octokit/rest'
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
const mongodbLevelStore = new MongodbLevel({
  collectionName: 'tinacms',
  dbName: 'tinacms',
  mongoUri: process.env.MONGODB_URI,
})
localLevelStore.openConnection()

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

export default createDatabase({
  level: isLocal ? localLevelStore : mongodbLevelStore,
  onPut: isLocal ? undefined : githubOnPut,
  onDelete: isLocal ? undefined : githubOnDelete,
})
