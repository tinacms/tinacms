import { login } from '.'

jest.mock('./prompt-credentials')
jest.mock('../../config')

describe('login', () => {
  let prompt: any
  let config: any
  beforeEach(() => {
    prompt = require('./prompt-credentials')
    prompt.promptCredentials.mockImplementation(() =>
      Promise.resolve({ email: 'test', password: 'pass' })
    )
    config = require('../../config')
  })

  it('write token to config', async () => {
    config.writeConfig = jest.fn(() => {})

    await login()
    expect(config.writeConfig).toHaveBeenCalledTimes(1)
  })
})
