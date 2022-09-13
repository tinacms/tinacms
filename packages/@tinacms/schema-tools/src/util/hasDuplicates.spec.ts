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

import { hasDuplicates, findDuplicates } from './hasDuplicates'

describe('hasDuplicates', () => {
  it('returns true when it has duplicates', () => {
    expect(hasDuplicates(['a', 'f', 'a'])).toEqual(true)
  })
  it('returns false when does not have duplicates', () => {
    expect(hasDuplicates(['a', 'f', 'v'])).toEqual(false)
  })
  it('returns false when undefined is passed', () => {
    expect(hasDuplicates(undefined)).toEqual(false)
  })
})

describe('findDuplicates', () => {
  it('returns the duplicate when it has duplicates', () => {
    expect(findDuplicates(['a', 'f', 'a'])).toEqual('"a"')
  })
  it('returns undefined when does not have duplicates', () => {
    expect(findDuplicates(['a', 'f', 'v'])).toEqual(undefined)
  })
  it('returns undefined when undefined is passed', () => {
    expect(findDuplicates(undefined)).toEqual(undefined)
  })
  it('returns a list of the duplicate when there is more then one', () => {
    expect(findDuplicates(['a', 'a', 'b', 'b'])).toEqual('"a", "b"')
    expect(findDuplicates(['a', 'a', 'b', 'b', 'b'])).toEqual('"a", "b"')
    expect(
      findDuplicates(['a', 'b', 'f', 'g', 'z', 'a', 'b', 'b', 'b', 'u'])
    ).toEqual('"a", "b"')
  })
})
