/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

const path = require('path')
const express = require('express')
const next = require('next')
const cors = require('cors')
const gitApi = require('@einsteinindustries/tinacms-api-git')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(cors())
  server.use(
    '/___tina',
    gitApi.router(
      {
        pathToRepo: path.join(process.cwd(), '../..'),
        pathToContent: 'packages/demo-next',
      },
      {
        defaultCommitMessage: 'chore: edited with tina',
        defaultCommitName: 'Uncle Rico',
        defaultCommitEmail: 'git@tinacms.org',
        pushOnCommit: false,
      }
    )
  )

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
