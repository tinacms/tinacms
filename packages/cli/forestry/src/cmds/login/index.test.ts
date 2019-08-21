import { login } from '.'

jest.mock('./prompt-credentials')
jest.mock('../../config')
jest.mock('axios')

describe('login', () => {
  let prompt: any
  let config: any
  let axios: any
  beforeEach(() => {
    prompt = require('./prompt-credentials')
    prompt.promptCredentials.mockImplementation(() =>
      Promise.resolve({ email: 'test@blah.ca', password: 'pass' })
    )
    config = require('../../config')
    axios = require('axios')

    axios.post.mockImplementation(() => Promise.resolve({ token: '12321' }))
  })

  afterEach(() => {
    axios.post.mockReset()
  })

  it('write token to config', async () => {
    config.writeConfig = jest.fn(() => {})

    await login()
    expect(config.writeConfig).toHaveBeenCalledTimes(1)
    expect(config.writeConfig).toHaveBeenCalledWith({ token: '12321' })
  })

  it('posts credentials to server', async () => {
    await login()
    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      email: 'test@blah.ca',
      password: 'pass',
    })
  })
})
