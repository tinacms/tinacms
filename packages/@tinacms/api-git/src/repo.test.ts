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

import * as os from 'os'

import { Repo, CommitOptions } from './repo'
import * as utils from './utils'
import * as fw from './file-writer'

describe('repo class', () => {
  if (os.type() == 'Windows_NT') {
    describe('on windows', () => {
      describe('with a new repo', () => {
        let repo: Repo
        beforeEach(() => {
          repo = new Repo('C:\\Users\\tina\\project', 'path\\to\\content')
        })

        it('sets properties', async () => {
          expect(repo.pathToRepo).toBe('C:\\Users\\tina\\project')
          expect(repo.pathToContent).toBe('path\\to\\content')
        })

        it('generates a proper content absolute path', async () => {
          expect(repo.contentAbsolutePath).toBe(
            'C:\\Users\\tina\\project\\path\\to\\content'
          )
        })

        it('generates a proper tmpdir path', async () => {
          expect(repo.tmpDir).toBe(
            'C:\\Users\\tina\\project\\path\\to\\content\\tmp'
          )
        })

        it('generates a proper ssh key file path', async () => {
          expect(repo.sshKeyPath).toBe('C:\\Users\\tina\\project\\.ssh\\id_rsa')
        })

        it('generates a proper file absolute path', async () => {
          expect(repo.fileAbsolutePath('some/file.html')).toBe(
            'C:\\Users\\tina\\project\\path\\to\\content\\some\\file.html'
          )
        })

        it('generates a proper file relative path', async () => {
          expect(repo.fileRelativePath('some/file.html')).toBe(
            'path/to/content/some/file.html'
          )
        })
      })
    })
  } else {
    describe('on linux or mac', () => {
      describe('with a new repo', () => {
        let repo: Repo
        beforeEach(() => {
          repo = new Repo('/Users/tina/project', 'path/to/content')
        })

        it('sets properties', async () => {
          expect(repo.pathToRepo).toBe('/Users/tina/project')
          expect(repo.pathToContent).toBe('path/to/content')
        })

        it('generates a proper content absolute path', async () => {
          expect(repo.contentAbsolutePath).toBe(
            '/Users/tina/project/path/to/content'
          )
        })

        it('generates a proper tmpdir path', async () => {
          expect(repo.tmpDir).toBe('/Users/tina/project/path/to/content/tmp')
        })

        it('generates a proper ssh key file path', async () => {
          expect(repo.sshKeyPath).toBe('/Users/tina/project/.ssh/id_rsa')
        })

        it('generates a proper file absolute path', async () => {
          expect(repo.fileAbsolutePath('some/file.html')).toBe(
            '/Users/tina/project/path/to/content/some/file.html'
          )
        })

        it('generates a proper file relative path', async () => {
          expect(repo.fileRelativePath('some/file.html')).toBe(
            'path/to/content/some/file.html'
          )
        })
      })
    })
  }

  describe('with a new repo', () => {
    let repo: Repo
    beforeEach(() => {
      repo = new Repo('/home/users/tina/project', 'path/to/content')
    })

    it('checks that files are in the contentAbsolutePath', async () => {
      // @ts-ignore
      utils.checkFilePathIsInParent = jest.fn()

      repo.fileIsInRepo('some/file.html')

      expect(utils.checkFilePathIsInParent).toBeCalledWith(
        'some/file.html',
        '/home/users/tina/project/path/to/content'
      )
    })

    describe('when writing a file', () => {
      it('writes the file when the file is within the content dir', async () => {
        repo.fileIsInRepo = jest.fn().mockReturnValue(true)
        // @ts-ignore
        fw.writeFile = jest.fn()

        repo.writeFile('some/file.html', 'contents')

        expect(fw.writeFile).toHaveBeenCalled()
      })

      it('throws an error when the file is outside of the content dir', async () => {
        repo.fileIsInRepo = jest.fn().mockReturnValue(false)
        // @ts-ignore
        fw.writeFile = jest.fn()

        expect(() => {
          repo.writeFile('some/file.html', 'contents')
        }).toThrowError()

        expect(fw.writeFile).not.toHaveBeenCalled()
      })
    })

    describe('when deleting a file', () => {
      it('deletes the file when the file is within the content dir and commits', async () => {
        repo.fileIsInRepo = jest.fn().mockReturnValue(true)
        repo.commit = jest.fn()
        // @ts-ignore
        fw.deleteFile = jest.fn()

        const co: CommitOptions = { files: [], message: '' }
        await repo.deleteFiles('some/file.html', co)

        expect(fw.deleteFile).toHaveBeenCalled()
        expect(repo.commit).toHaveBeenCalled()
      })

      it('throws an error when the file is outside of the content dir', async () => {
        repo.fileIsInRepo = jest.fn().mockReturnValue(false)
        repo.commit = jest.fn()
        // @ts-ignore
        fw.deleteFile = jest.fn()

        const co: CommitOptions = { files: [], message: '' }
        await expect(
          repo.deleteFiles('some/file.html', co)
        ).rejects.toThrowError()

        expect(fw.deleteFile).not.toHaveBeenCalled()
        expect(repo.commit).not.toHaveBeenCalled()
      })
    })
  })

  // describe('without a remote', () => {
  //   beforeEach(() => {
  //     repo = new Repo()
  //     repo.getOrigin = jest.fn()
  //     repo.updateOrigin = jest.fn()
  //   })

  //   it('does not throw an error', async () => {
  //     expect(async () => {
  //       await updateRemoteToSSH(repo)
  //     }).not.toThrowError()
  //   })

  //   it('does not try to update the origin', async () => {
  //     await updateRemoteToSSH(repo)
  //     expect(repo.updateOrigin).not.toHaveBeenCalledWith(
  //       'git@github.com:tinacms/tunacms.git'
  //     )
  //   })
  // })
})
