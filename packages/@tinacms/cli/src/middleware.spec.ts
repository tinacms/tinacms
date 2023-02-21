/**

*/

import { chain } from './middleware'

describe('middleware', () => {
  beforeEach(() => {
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any)
  })
  it('calls each cmd', async () => {
    const fn1 = createMiddlewareFn()
    const fn2 = createMiddlewareFn()

    await chain([fn1, fn2], {})

    expect(fn1).toHaveBeenCalledTimes(1)
  })

  it('passes along updated ctx', async () => {
    const fn1 = jest.fn(async (_ctx: any, next: any, _options: any) => {
      _ctx.foo = 'bar'
      await next()
    })
    const fn2 = jest.fn(async (_ctx: any, next: any, _options: any) => {
      expect(_ctx.foo).toEqual('bar')
      await next()
    })

    await chain([fn1, fn2], {})
  })

  it('stops execution when error thrown', async () => {
    const fn1 = jest.fn(async () => {
      throw new Error()
    })
    const fn2 = jest.fn()

    try {
      await chain([fn1, fn2], {})
    } catch {}
    expect(fn2).not.toHaveBeenCalled()
  })
})

const createMiddlewareFn = (fn: any = () => {}) =>
  jest.fn(async (_ctx: any, next: any, _options: any) => {
    await next()
  })
