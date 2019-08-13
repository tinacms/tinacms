import * as express from 'express'
import * as cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as openRepo from 'simple-git/promise'

const GIT_SSH_COMMAND =
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

exports.onPreBootstrap = () => {
  let app = express()

  let pathRoot = process.cwd()

  const repo = openRepo(pathRoot)
  // TODO: Don't do this
  repo.env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
  repo.addConfig('user.name', "Nolan's Preview Server")
  repo.addConfig('user.email', 'nolan@forestry.io')

  app.use(
    cors({
      origin: function(origin, callback) {
        // TODO: Only accept from localhost.
        callback(null, true)
      },
    })
  )
  app.use(express.json())

  app.post('/x-server/commit', (req, res) => {
    let files = req.body.files.map((rel: string) => path.join(pathRoot, rel))
    // TODO: Allow request to send the message
    repo.commit('gatsby-xeditor-git change', ...files)
    // TODO: Wait for push to finishe
    // TODO: Separate commit and push???
    repo.push()
    res.send('okay')
  })

  app.put('/x-server/markdownRemark', (req, res) => {
    let filePath = path.join(pathRoot, req.body.fileRelativePath)
    fs.writeFileSync(filePath, req.body.content)
    res.send(req.body.content)
  })

  app.listen(4567, () => {
    console.log('------------------------------------------')
    console.log('xeditor local backend running on port 4567')
    console.log('------------------------------------------')
  })
}

exports.onCreateNode = ({ node, actions }: any) => {
  let pathRoot = process.cwd()

  if (node.internal && node.internal.type === 'MarkdownRemark') {
    actions.createNodeField({
      node,
      name: 'fileRelativePath',
      value: node.fileAbsolutePath.replace(pathRoot, ''),
    })
  }
}
