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
import { describe, it, expect } from 'vitest'
import * as util from './util'

describe('getAllIn', () => {
  it('gets the values', async () => {
    const result = util.getAllIn({ some: { value: 'a' } }, 'some.value')
    expect(result).toEqual([{ value: 'a' }])
  })
  it('gets the values from an array', async () => {
    const result = util.getAllIn(
      { some: { values: ['a', 'b'] } },
      'some.values'
    )
    expect(result).toEqual([
      { location: [0], value: 'a' },
      { location: [1], value: 'b' },
    ])
  })
  it('gets values from an array of objects', async () => {
    const result = util.getAllIn(
      { some: { values: [{ nested: 'a' }] } },
      'some.values.[].nested'
    )
    expect(result).toEqual([{ location: [0], value: 'a' }])
  })
  it('gets null values', async () => {
    const result = util.getAllIn({ some: { values: null } }, 'some.values')
    expect(result).toEqual([{ value: null }])
  })
  // FIXME: not sure we'll need this
  it('gets deeply-nested the values', async () => {
    const result = util.getAllIn(
      { some: { values: [{ nested: [{ again: 'a' }] }] } },
      'some.values.[].nested.[].again'
    )
    expect(result).toEqual([{ location: [0, 0], value: 'a' }])
  })
})
