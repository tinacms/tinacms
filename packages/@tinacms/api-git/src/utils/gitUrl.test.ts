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
