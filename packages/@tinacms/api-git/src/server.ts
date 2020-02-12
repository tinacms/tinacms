/**

Copyright 2019 Forestry.io Inc

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

const express = require('express')
const cors = require('cors')

import { router, GitServerConfig } from './router'
import { configureGitRemote } from './configure'
import { Repo } from './repo'

export class GitApiServer {
  server: any
  constructor(repo: Repo, config: GitServerConfig) {
    if (process.env.TINA_CEE !== undefined) {
      configureGitRemote(repo, config.gitRemote, config.sshKey)
    }
    this.server = express()
    this.server.use(cors())
    this.server.use('/___tina', router(repo, config))
  }

  start(port: number) {
    this.server.listen(port)
    console.log(`TinaCMS git API server running on localhost:${port}`)
  }
}
