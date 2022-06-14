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

import { parseMediaFolder } from '.'

describe('parseMediaFolder', () => {
  it('removes the starting slash when it is there', () => {
    expect(parseMediaFolder('/')).toBe('')

    expect(parseMediaFolder('/foo')).toBe('foo')
    expect(parseMediaFolder('/foo/bar')).toBe('foo/bar')
  })
  it('does not remove the starting slash when there is no starting slash', () => {
    expect(parseMediaFolder('foo')).toBe('foo')
    expect(parseMediaFolder('foo/bar')).toBe('foo/bar')
  })
  it('removes the trailing slash when there is one', () => {
    expect(parseMediaFolder('foo/')).toBe('foo')
    expect(parseMediaFolder('foo/bar/')).toBe('foo/bar')
  })
  it('removes the starting and trailing slash when there is both', () => {
    expect(parseMediaFolder('//')).toBe('')
    expect(parseMediaFolder('/foo/')).toBe('foo')
    expect(parseMediaFolder('/foo/bar/')).toBe('foo/bar')
  })
})
