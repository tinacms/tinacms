import { requestGitProvider } from './requestGitProvider'

jest.mock('inquirer')

describe('requestGitProvider', () => {
  describe('with known git provider', () => {
    it('return correct provider remote using ssh', async () => {
      const result = await requestGitProvider(
        'git@github.com:forestryio/test-repo.git'
      )
      expect(result).toEqual('github')
    })

    it('return correct provider remote using http', async () => {
      const result = await requestGitProvider(
        'https://gitlab.com/forestryio/test-repo.git'
      )
      expect(result).toEqual('gitlab')
    })

    //todo - Test for repos with "github or gitlab in the repeo name"
  })

  describe('with unknown git providers', () => {
    let inquirer: any
    beforeEach(() => {
      inquirer = require('inquirer')
      inquirer.prompt.mockImplementation(() =>
        Promise.resolve({ gitProvider: 'custom-provider' })
      )
    })

    it('return user prompted gitProvider if remote format unknown', async () => {
      const result = await requestGitProvider('unknown')
      expect(result).toEqual('custom-provider')
    })
  })
})
