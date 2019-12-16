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

import { getGitSSHUrl } from './gitUrl'
describe('getGitSSHUrl', () => {
  it('returns original ssh urrl', () => {
    let input = 'git@bitbucket.org:tinacms/tinacms.git'

    let output = getGitSSHUrl(input)

    expect(output).toBe(input)
  })

  it('converts bitbucket http url', () => {
    let input = 'https://bitbucket.org/tinacms/tinacms.git'

    let output = getGitSSHUrl(input)

    expect(output).toBe('git@bitbucket.org:tinacms/tinacms.git')
  })

  it('converts github http url', () => {
    let input = 'https://github.com/tinacms/tinacms.git'

    let output = getGitSSHUrl(input)

    expect(output).toBe('git@github.com:tinacms/tinacms.git')
  })

  it('converts gitlab http url', () => {
    let input = 'https://gitlab.com/tinacms/tinacms.git'

    let output = getGitSSHUrl(input)

    expect(output).toBe('git@gitlab.com:tinacms/tinacms.git')
  })
})
