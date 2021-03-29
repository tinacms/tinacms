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

import { GitClient, GitMediaStore } from '@tinacms/git-client'

declare let window: any

exports.onClientEntry = () => {
  if (!window.tinacms) {
    throw new Error(ERROR_TINACMS_NOT_FOUND)
  }
  const { protocol, hostname, port } = window.location
  const baseUrl = `${protocol}//${hostname}${
    port != '80' ? `:${port}` : ''
  }/___tina`

  const client = new GitClient(baseUrl)
  window.tinacms.registerApi('git', client)
  window.tinacms.media.store = new GitMediaStore(client)
}

const ERROR_TINACMS_NOT_FOUND = `\`window.tinacms\` not found

1. Make sure to add \`gatsby-plugin-tinacms\` to your \`gatsby-config.js\`
2. Make sure \`gatsby-tinacms-git\` is a sub-plugin of \`gatsby-plugin-tinacms\`

{
  resolve: "gatsby-plugin-tinacms",
  options: {
    plugins: [
      "gatsby-tinacms-git",
    ]
  }
}

`
