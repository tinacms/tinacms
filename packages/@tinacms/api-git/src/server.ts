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

import express from 'express'
import cors from 'cors'

import { router, GitRouterConfig } from './router'
import { configureGitRemote } from './configure'
import { Repo } from './repo'

export interface GitServerConfig extends GitRouterConfig {
  pathToRepo: string
  pathToContent: string
  gitRemote?: string
  sshKey?: string
}

export class GitApiServer {
  server: any
  constructor(options: Partial<GitServerConfig>) {
    const {
      pathToRepo,
      pathToContent,
      gitRemote,
      sshKey,
      ...routerOptions
    } = options

    const repo = new Repo(pathToRepo, pathToContent)

    // NOTE: Environment variables are always interpreted as strings. If TINA_CEE is set to anything, this will evaluate as true
    if (process.env.TINA_CEE !== undefined) {
      configureGitRemote(repo, gitRemote, sshKey)
    }
    this.server = express()
    this.server.use(cors())
    this.server.use('/___tina', router(repo, routerOptions))
  }

  start(port: number) {
    this.server.listen(port)
    console.log(`TinaCMS git API server running on localhost:${port}`)
  }
}
