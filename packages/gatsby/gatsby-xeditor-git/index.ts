import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import * as openRepo from 'simple-git/promise'
import { audit } from './audit'

const GIT_SSH_COMMAND =
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

exports.extendXserver = (server: any, config: any) => {
  let pathRoot = process.cwd()

  const repo = openRepo(pathRoot)
  // TODO: Don't do this
  repo.env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
  repo.addConfig('user.name', "Nolan's Preview Server")
  repo.addConfig('user.email', 'nolan@forestry.io')

  server.use(express.json())

  server.post(`${config.routePrefix}/commit`, (req: any, res: any) => {
    let files = req.body.files.map((rel: string) => path.join(pathRoot, rel))
    // TODO: Allow request to send the message
    repo.commit('gatsby-xeditor-git change', ...files)
    // TODO: Wait for push to finishe
    // TODO: Separate commit and push???
    repo.push()
    res.send('okay')
  })

  let writeFile = audit((body: any) => {
    let filePath = path.join(pathRoot, body.fileRelativePath)
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, body.content, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  })

  server.put(`${config.routePrefix}/markdownRemark`, (req: any, res: any) => {
    writeFile(req.body)
    res.send(req.body.content)
  })
}
