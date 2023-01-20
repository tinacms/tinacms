import { createDatabase } from '@tinacms/graphql'
import { FilesystemBridge } from '@tinacms/datalayer'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'
const { ManyLevelGuest } = require('many-level')
const { pipeline } = require('readable-stream')
const { connect } = require('net')

const owner = ''
const repo = ''
const token = ''
const branch = ''

const octokit = new Octokit({
  auth: token,
})

const level = new ManyLevelGuest()
const socket = connect(9000)

// Pipe socket into guest stream and vice versa
pipeline(socket, level.createRpcStream(), socket, () => {
  // Disconnected
})

export default createDatabase({
  bridge: new FilesystemBridge(process.cwd()),
  level,
  onPut: async (key, value) => {
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
  },
  onDelete: async (key) => {
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
  },
})
