import { getGitHttpUrl } from './gitUrl'

describe('Get Git Http Url', () => {
  beforeEach(() => {})

  const demoHttpUrl = 'https://github.com/jamespohalloran/forestry-demo__1211'
  const demoSSHUrl = 'git@github.com:jamespohalloran/forestry-demo__1211.git'
  it('trims .git from https url', () => {
    const url = getGitHttpUrl(`${demoHttpUrl}.git`)
    expect(url).toEqual(demoHttpUrl)
  })

  it('returns formatted https url correctly', () => {
    const url = getGitHttpUrl(demoHttpUrl)
    expect(url).toEqual(demoHttpUrl)
  })

  it('converts from ssh url correctly', () => {
    const url = getGitHttpUrl(demoSSHUrl)
    expect(url).toEqual(demoHttpUrl)
  })

  describe('with multiple .git segments in username and repo', () => {
    const demoGithubIOHttpUrl =
      'https://github.com/james.gitpohalloran/forestry-dem.github.io'
    const demoGithubIOSSHUrl =
      'git@github.com:james.gitpohalloran/forestry-dem.github.io.git'
    it('trims .git from https url', () => {
      const url = getGitHttpUrl(`${demoGithubIOHttpUrl}.git`)
      expect(url).toEqual(demoGithubIOHttpUrl)
    })

    it('returns formatted https url correctly', () => {
      const url = getGitHttpUrl(demoGithubIOHttpUrl)
      expect(url).toEqual(demoGithubIOHttpUrl)
    })

    it('converts from ssh url correctly', () => {
      const url = getGitHttpUrl(demoGithubIOSSHUrl)
      expect(url).toEqual(demoGithubIOHttpUrl)
    })
  })
})
