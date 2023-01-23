import { createDatabase } from '@tinacms/graphql'
import { FilesystemBridge } from '@tinacms/datalayer'
import { TinaLocalLevel } from '@tinacms/cli'
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import { Base64 } from 'js-base64'

const owner = ''
const repo = ''
const token = ''
const branch = ''

const octokit = new Octokit({
  auth: token,
})

const localLevelStore = new TinaLocalLevel()

export default createDatabase({
  bridge: new FilesystemBridge(process.cwd()),
  level: localLevelStore,
  onPut: async (key, value) => {
    const filePath = path.join(process.cwd(), key)
    fs.writeFileSync(filePath, value)
    console.log('putting', key, value)
    // let sha
    // try {
    //   const {
    //     data: { sha: existingSha },
    //   } = await octokit.repos.getContent({
    //     owner,
    //     repo,
    //     path: key,
    //     branch,
    //   })
    //   sha = existingSha
    // } catch (e) {}

    // const { data } = await octokit.repos.createOrUpdateFileContents({
    //   owner,
    //   repo,
    //   path: key,
    //   message: 'commit from self-hosted tina',
    //   content: Base64.encode(value),
    //   branch,
    //   sha,
    // })
  },
  onDelete: async (key) => {
    const filePath = path.join(process.cwd(), key)
    console.log('deleting', filePath)
    fs.rmSync(filePath)
    // let sha
    // try {
    //   const {
    //     data: { sha: existingSha },
    //   } = await octokit.repos.getContent({
    //     owner,
    //     repo,
    //     path: key,
    //     branch,
    //   })
    //   sha = existingSha
    // } catch (e) {
    //   console.log(e)
    // }
    // if (sha) {
    //   const { data } = await octokit.repos.deleteFile({
    //     owner,
    //     repo,
    //     path: key,
    //     message: 'commit from self-hosted tina',
    //     branch,
    //     sha,
    //   })
    //   console.log('data', data)
    // }
  },
})
