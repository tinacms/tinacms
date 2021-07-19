/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
