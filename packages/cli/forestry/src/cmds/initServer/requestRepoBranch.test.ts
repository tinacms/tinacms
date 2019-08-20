import { requestRepoBranch } from './requestRepoBranch'

jest.mock('inquirer')
jest.mock('simple-git/promise')

describe('requestRepoBranch', () => {
  let inquirer: any
  let simpleGit: any

  const repoUrl = 'git@github.com:forestryio/test.git'
  beforeEach(() => {
    inquirer = require('inquirer')
    inquirer.prompt.mockImplementation(() =>
      Promise.resolve({ branch: 'test1' })
    )

    simpleGit = require('simple-git/promise')

    simpleGit.mockImplementation(() => {
      return {
        getRemotes: (__verbose: boolean) =>
          Promise.resolve([
            {
              name: 'fake1',
              refs: {
                fetch: 'git@github.com:forestryio/faketest1.git',
                push: 'git@github.com:forestryio/faketest1.git',
              },
            },
            {
              name: 'origin',
              refs: {
                fetch: repoUrl,
                push: repoUrl,
              },
            },
            {
              name: 'fake2',
              refs: {
                fetch: 'git@github.com:forestryio/faketest2.git',
                push: 'git@github.com:forestryio/faketest2.git',
              },
            },
          ]),
        branch: (options: string[]) =>
          Promise.resolve({
            all: ['master', 'test1', 'test2'],
            current: 'master',
          }),
      }
    })
  })

  it('returns origin remote', async () => {
    const result = await requestRepoBranch()
    expect(result.repo).toEqual(repoUrl)
  })

  it('returns selected branch', async () => {
    const result = await requestRepoBranch()
    expect(result.branch).toEqual('test1')
  })
})
