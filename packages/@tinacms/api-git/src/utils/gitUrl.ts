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

export const getGitSSHUrl = (url: string) => {
  const isSSH = isSSHUrl(url)
  if (isSSH) {
    return url
  }
  const match = url.match(
    new RegExp(`https:\/\/(.*?@)?(.+?)\/(.*?)(?:\.git)?$`)
  )
  let domain = match && match.length > 2 ? match[2] : ''
  let usernameRepo = match && match.length > 3 ? match[3] : ''
  return `git@${domain}:${usernameRepo}.git`
}

export const isSSHUrl = (str: string) => {
  return str.startsWith('git@') || str.startsWith('ssh://')
}
