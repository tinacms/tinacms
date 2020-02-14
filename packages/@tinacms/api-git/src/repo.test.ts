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

        // TODO: This needs to be figured out on windows
        it.skip('generates a proper file relative path', async () => {
          expect(repo.fileRelativePath('some/file.html')).toBe(
            'path/to/content/some/file.html'
          )
        })

        it('checks that files are in the contentAbsolutePath', async () => {
          // @ts-ignore
          utils.checkFilePathIsInParent = jest.fn()

          repo.fileIsInRepo('some/file.html')

          expect(utils.checkFilePathIsInParent).toBeCalledWith(
            'some/file.html',
            'C:\\Users\\tina\\project\\path\\to\\content'
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

        it('checks that files are in the contentAbsolutePath', async () => {
          // @ts-ignore
          utils.checkFilePathIsInParent = jest.fn()

          repo.fileIsInRepo('some/file.html')

          expect(utils.checkFilePathIsInParent).toBeCalledWith(
            'some/file.html',
            '/Users/tina/project/path/to/content'
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

    describe('when committing', () => {
      let simplegit: any
      let commitOptions: CommitOptions
      let absFiles: string[]
      const message = 'hello world'
      const files = ['some/file.html']

      beforeEach(() => {
        simplegit = jest.fn()
        simplegit.add = jest.fn()
        simplegit.commit = jest.fn()

        repo.open = jest.fn().mockReturnValue(simplegit)
        commitOptions = { files, message }
        absFiles = files.map(rel => repo.fileAbsolutePath(rel))
      })

      it('does not set the author when email is not set', async () => {
        await repo.commit(commitOptions)
        expect(simplegit.commit).toHaveBeenCalledWith(
          message,
          absFiles,
          undefined
        )
      })

      it('sets the author when the email is set', async () => {
        await repo.commit({ ...commitOptions, email: 'hello@tinacms.org' })
        expect(simplegit.commit).toHaveBeenCalledWith(message, absFiles, {
          '--author': '"hello@tinacms.org <hello@tinacms.org>"',
        })
      })

      it('sets the name and email when the name and email are set', async () => {
        await repo.commit({
          ...commitOptions,
          email: 'hello@tinacms.org',
          name: 'Tina CMS',
        })
        expect(simplegit.commit).toHaveBeenCalledWith(message, absFiles, {
          '--author': '"Tina CMS <hello@tinacms.org>"',
        })
      })

      it('adds all files to be committed', async () => {
        await repo.commit(commitOptions)
        expect(simplegit.add).toHaveBeenCalledWith(absFiles)
      })

      it('makes a commit', async () => {
        await repo.commit(commitOptions)
        expect(simplegit.commit).toHaveBeenCalled()
      })
    })

    describe('when pushing', () => {
      let simplegit: any

      beforeEach(() => {
        simplegit = jest.fn()
        simplegit.revparse = jest.fn().mockResolvedValue('master')
        simplegit.push = jest.fn()

        repo.open = jest.fn().mockReturnValue(simplegit)
      })

      it('pushes to the correct branch', async () => {
        await repo.push()

        expect(simplegit.push).toHaveBeenCalledWith(['-u', 'origin', 'master'])
      })
    })

    describe('when getting a file', () => {
      let simplegit: any

      beforeEach(() => {
        simplegit = jest.fn()
        simplegit.show = jest.fn()
        repo.open = jest.fn().mockReturnValue(simplegit)
      })

      it('asks for the file without leading slashes', async () => {
        await repo.getFileAtHead('some/file.html')
        expect(simplegit.show).toHaveBeenCalledWith([
          'HEAD:path/to/content/some/file.html',
        ])
      })

      it.skip('uses the current file on disk if fails to get it from git', async () => {
        // TODO: Can't figure out how to test this
        // simplegit.show = jest.fn().mockRejectedValue(new Error())
        // await repo.getFileAtHead('some/file.html')
        // expect(fs.readFileSync).toHaveBeenCalledWith(
        //   '/home/users/tina/project/path/to/content/some/file.html'
        // )
      })
    })

    describe('when getting the origin', () => {
      let simplegit: any

      beforeEach(() => {
        simplegit = jest.fn()
        repo.open = jest.fn().mockReturnValue(simplegit)
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('returns the push ref for origin if we have an origin', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'origin', refs: { push: 'push' } }])
        const result = await repo.getOrigin()
        expect(result).toBe('push')
      })

      it('returns nothing when there is no origin', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'notorigin', refs: { push: 'push' } }])

        const result = await repo.getOrigin()
        expect(result).toBe(undefined)
      })

      it('warns the user when there is no origin', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'notorigin', refs: { push: 'push' } }])

        jest.spyOn(console, 'warn')
        await repo.getOrigin()
        expect(console.warn).toHaveBeenCalled()
      })

      it('does not warn the user when there is an origin', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'origin', refs: { push: 'push' } }])

        jest.spyOn(console, 'warn')
        expect(console.warn).not.toHaveBeenCalled()
      })
    })

    describe('when updating the origin', () => {
      let simplegit: any

      beforeEach(() => {
        simplegit = jest.fn()
        simplegit.removeRemote = jest.fn()
        simplegit.addRemote = jest.fn()
        repo.open = jest.fn().mockReturnValue(simplegit)
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('removes the existing remote', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'origin', refs: { push: 'push' } }])
        await repo.updateOrigin('neworiginurl')
        expect(simplegit.removeRemote).toHaveBeenCalled()
      })

      it('warns the user when replacing an existing origin', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'origin', refs: { push: 'push' } }])
        jest.spyOn(console, 'warn')
        await repo.updateOrigin('neworiginurl')
        expect(console.warn).toHaveBeenCalled()
      })

      it('does not warn the user if there is not already an origin', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'notorigin', refs: { push: 'push' } }])
        jest.spyOn(console, 'warn')
        await repo.updateOrigin('neworiginurl')
        expect(console.warn).not.toHaveBeenCalled()
      })

      it('adds the new remote', async () => {
        simplegit.getRemotes = jest
          .fn()
          .mockResolvedValue([{ name: 'origin', refs: { push: 'push' } }])
        await repo.updateOrigin('neworiginurl')
        expect(simplegit.addRemote).toHaveBeenCalledWith(
          'origin',
          'neworiginurl'
        )
      })
    })
  })
})
