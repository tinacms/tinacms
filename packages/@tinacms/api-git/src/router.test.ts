import { checkFilePathIsInGitRepo } from './router'

describe('checkFilePathIsInGitRepo', () => {
  test('returns false if path not in repo', () => {
    const fileRelativePath = '../../../some-outside-file.json'
    const repoAbsPath = __dirname + '/..'
    expect(checkFilePathIsInGitRepo(fileRelativePath, repoAbsPath)).toBeFalsy()
  })

  test('returns true if path in repo', () => {
    const fileRelativePath = './some-inside-file.json'
    const repoAbsPath = __dirname + '/..'
    expect(checkFilePathIsInGitRepo(fileRelativePath, repoAbsPath)).toBeTruthy()
  })
})
