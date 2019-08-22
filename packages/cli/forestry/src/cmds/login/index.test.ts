import { login } from '.'

jest.mock('../../config')
jest.mock('./waitForAuth')
jest.mock('./createExpressApp')

describe('login', () => {
  let createExpressApp: any
  let config: any
  let waitForAuth: any

  const closeFn = jest.fn()
  beforeEach(() => {
    config = require('../../config')
    waitForAuth = require('./waitForAuth').waitForAuth
    createExpressApp = require('./createExpressApp').createExpressApp

    createExpressApp.mockImplementation(() => {
      return {
        listen: () => {
          return {
            close: closeFn,
          }
        },
      }
    })

    waitForAuth.mockImplementation(() => Promise.resolve({ token: '12321' }))
  })

  afterEach(() => {
    waitForAuth.mockReset()
    closeFn.mockReset()
  })

  it('write token to config', async () => {
    config.writeConfig = jest.fn(() => {})

    await login()
    expect(config.writeConfig).toHaveBeenCalledTimes(1)
    expect(config.writeConfig).toHaveBeenCalledWith({
      auth: { token: '12321' },
    })
  })

  it('closes server when done', async () => {
    await login()
    expect(closeFn).toHaveBeenCalledTimes(1)
  })
})
