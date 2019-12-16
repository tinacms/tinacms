import { checkFilePathIsInRepo, updateRemoteToSSH } from './router'
jest.mock('./open-repo')

describe('checkFilePathIsInRepo', () => {
  test('returns false if path not in repo', () => {
    const fileRelativePath = '../../../some-outside-file.json'
    const repoAbsPath = __dirname + '/..'
    expect(checkFilePathIsInRepo(fileRelativePath, repoAbsPath)).toBeFalsy()
  })

  test('returns true if path in repo', () => {
    const fileRelativePath = './some-inside-file.json'
    const repoAbsPath = __dirname + '/..'
    expect(checkFilePathIsInRepo(fileRelativePath, repoAbsPath)).toBeTruthy()
  })
})

describe('updateRemoteToSSH', () => {
  let mock

  let repo: any

  describe('with http remote', () => {
    beforeEach(() => {
      repo = {
        getRemotes: jest.fn().mockImplementation(() => {
          return Promise.resolve([
            {
              name: 'origin',
              refs: {
                push: 'https://github.com/tinacms/tunacms.git',
              },
            },
          ])
        }),
        removeRemote: jest.fn(),
        addRemote: jest.fn(),
      }
      mock = require('./open-repo').openRepo
      mock.mockImplementation(() => {
        return repo
      })
    })

    test('should replace remote', async () => {
      await updateRemoteToSSH('./')
      expect(repo.addRemote).toHaveBeenCalledWith(
        'origin',
        'git@github.com:tinacms/tunacms.git'
      )
    })
  })

  describe('with ssh remote', () => {
    beforeEach(() => {
      repo = {
        getRemotes: jest.fn().mockImplementation(() => {
          return Promise.resolve([
            {
              name: 'origin',
              refs: {
                push: 'git@github.com:tinacms/tunacms.git',
              },
            },
          ])
        }),
        removeRemote: jest.fn(),
        addRemote: jest.fn(),
      }
      mock = require('./open-repo').openRepo
      mock.mockImplementation(() => {
        return repo
      })
    })

    test('should replace remote', async () => {
      await updateRemoteToSSH('./')
      expect(repo.addRemote).not.toHaveBeenCalled()
    })
  })
})
