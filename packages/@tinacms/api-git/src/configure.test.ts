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

import { updateRemoteToSSH } from './configure'
import { Repo } from './repo'

describe('updateRemoteToSSH', () => {
  let repo: Repo

  describe('without a remote', () => {
    beforeEach(() => {
      repo = new Repo()
      repo.getOrigin = jest.fn()
      repo.updateOrigin = jest.fn()
    })

    it('does not throw an error', async () => {
      expect(async () => {
        await updateRemoteToSSH(repo)
      }).not.toThrowError()
    })

    it('does not try to update the origin', async () => {
      await updateRemoteToSSH(repo)
      expect(repo.updateOrigin).not.toHaveBeenCalledWith(
        'git@github.com:tinacms/tunacms.git'
      )
    })
  })

  describe('with http remote', () => {
    beforeEach(() => {
      repo = new Repo()
      repo.getOrigin = jest
        .fn()
        .mockResolvedValue('https://github.com/tinacms/tunacms.git')
      repo.updateOrigin = jest.fn()
    })

    test('should try to update the origin', async () => {
      await updateRemoteToSSH(repo)
      expect(repo.updateOrigin).toHaveBeenCalledWith(
        'git@github.com:tinacms/tunacms.git'
      )
    })
  })

  describe('with ssh remote', () => {
    beforeEach(() => {
      repo = new Repo()
      repo.getOrigin = jest
        .fn()
        .mockResolvedValue('git@github.com:tinacms/tunacms.git')
      repo.updateOrigin = jest.fn()
    })

    test('should replace remote', async () => {
      await updateRemoteToSSH(repo)
      expect(repo.updateOrigin).not.toHaveBeenCalled()
    })
  })
})
