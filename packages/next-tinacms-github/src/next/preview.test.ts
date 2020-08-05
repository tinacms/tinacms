import { previewHandler } from './preview'
import { ReqStub, ResStub } from '../test-helpers'

describe('previewHandler', () => {
  describe('without a signing key', () => {
    it('responds with status 500', async () => {
      // @ts-ignore That's the point of the test.
      const handler = previewHandler(undefined)
      const req = new ReqStub()
      const res = new ResStub()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
    it('sends JSON response', async () => {
      // @ts-ignore That's the point of the test.
      const handler = previewHandler(undefined)
      const req = new ReqStub()
      const res = new ResStub()

      await handler(req, res)

      expect(res.json).toHaveBeenCalled()
    })
  })
  describe('with a signing key', () => {
    describe('when CSRF token is not in the request cookies ', () => {
      it('responds with status 401', async () => {
        const handler = previewHandler('example-signing-key')
        const req = new ReqStub()
        const res = new ResStub()

        await handler(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
      })
    })
    describe('when CSRF token is in the request cookies', () => {
      describe('when "authorization" token is not in headers', () => {
        it('responds with status 401', async () => {
          const handler = previewHandler('example-signing-key')
          const req = new ReqStub()
          const res = new ResStub()

          await handler(req, res)

          expect(res.status).toHaveBeenCalledWith(401)
        })
      })
      describe('when "authorization" token is in headers', () => {
        describe('when CSRF token is valid', () => {
          it.skip('sets preview data', () => {})
          it.skip('responds with status 200', () => {})
        })
        describe('when CSRF token is invalid', () => {
          it.skip('responds with status 401', () => {})
        })
      })
    })
  })
})
