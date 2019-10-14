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

import { GitClient } from '@tinacms/git-client'

declare let window: any

exports.onClientEntry = () => {
  if (!window.tinacms) {
    throw new Error(
      '`window.tinacms` not found. Did you forget to add `gatsby-plugin-tinacms` to your `gatsby-config.js`?'
    )
  }
  const { protocol, hostname, port } = window.location
  const baseUrl = `${protocol}//${hostname}${
    port != '80' ? `:${port}` : ''
  }/___tina`

  window.tinacms.registerApi('git', new GitClient(baseUrl))
}
