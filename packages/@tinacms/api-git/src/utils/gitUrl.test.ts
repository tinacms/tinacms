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
  describe('with ssh url', () => {
    it('returns original ssh url', () => {
      const input = 'git@bitbucket.org:tinacms/tinacms.git'

      const output = getGitSSHUrl(input)

      expect(output).toBe(input)
    })
  })

  describe('with http url', () => {
    it('converts bitbucket http url', () => {
      const input = 'https://bitbucket.org/tinacms/tinacms.git'

      const output = getGitSSHUrl(input)

      expect(output).toBe('git@bitbucket.org:tinacms/tinacms.git')
    })

    it('converts github http url', () => {
      const input = 'https://github.com/tinacms/tinacms.git'

      const output = getGitSSHUrl(input)

      expect(output).toBe('git@github.com:tinacms/tinacms.git')
    })

    it('converts gitlab http url', () => {
      const input = 'https://gitlab.com/tinacms/tinacms.git'

      const output = getGitSSHUrl(input)

      expect(output).toBe('git@gitlab.com:tinacms/tinacms.git')
    })

    it('converts http with auth', () => {
      const input =
        'https://api-key:fewhuyfgerguyrebrhe@gitlab.com/tinacms/tinacms.git'

      const output = getGitSSHUrl(input)

      expect(output).toBe('git@gitlab.com:tinacms/tinacms.git')
    })

    it('converts http without .git', () => {
      const input =
        'https://api-key:fewhuyfgerguyrebrhe@gitlab.com/tinacms/tinacms'

      const output = getGitSSHUrl(input)

      expect(output).toBe('git@gitlab.com:tinacms/tinacms.git')
    })
  })
})
