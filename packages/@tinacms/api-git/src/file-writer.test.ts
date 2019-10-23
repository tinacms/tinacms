import { checkFilePathIsInGitRepo } from './file-writer'

test('Check path if is in git repo - bad', () => {
  const fileRelativePath = '../../../some-outside-file.json'
  const repoAbsPath = __dirname + '/..'
  expect(checkFilePathIsInGitRepo(fileRelativePath, repoAbsPath)).toBeFalsy();
});

test('Check path if is in git repo - good', () => {
  const fileRelativePath = './some-inside-file.json'
  const repoAbsPath = __dirname + '/..'
  expect(checkFilePathIsInGitRepo(fileRelativePath, repoAbsPath)).toBeTruthy();
});
