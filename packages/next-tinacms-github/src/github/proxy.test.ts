import { apiProxy } from './proxy'
import { ReqStub, ResStub } from '../test-helpers'

describe('apiProxy', () => {
  describe('without a signing key', () => {
    it('responds with status 500', async () => {
      // @ts-ignore That's the point of the test.
      const handler = apiProxy(undefined)
      const req = {}
      const res = new ResStub()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
    it('sends JSON response', async () => {
      // @ts-ignore That's the point of the test.
      const handler = apiProxy(undefined)
      const req = {}
      const res = new ResStub()

      await handler(req, res)

      expect(res.json).toHaveBeenCalled()
    })
  })
  describe('when CSRF token is not in the request cookies ', () => {
    it('responds with status 401', async () => {
      const handler = apiProxy('example-signing-key')
      const req = new ReqStub()
      const res = new ResStub()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })
  })
})
