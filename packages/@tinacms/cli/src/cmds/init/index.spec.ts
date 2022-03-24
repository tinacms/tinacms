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

import { checkPackage, MIN_REACT_VERSION } from '.'
import tinaPackageJSON from '../../../../../tinacms/package.json'

/**
 * Ensure our CLI dependency check uses the min
 * peer dep we specify in `tinacms`
 */
describe('MIN_REACT_VERSION', () => {
  it('matches the min peer dep on tinacms', () => {
    expect(tinaPackageJSON.peerDependencies.react).toEqual(MIN_REACT_VERSION)
    expect(tinaPackageJSON.peerDependencies['react-dom']).toEqual(
      MIN_REACT_VERSION
    )
  })
})

describe('checkPackage', () => {
  it('returns false for lower minor versions', () => {
    const getit = checkPackage({ dependencies: { react: '16.0.0' } }, 'react')

    expect(getit).toBe(false)
  })
  it('returns false for lower minor versions using ^', () => {
    const getit = checkPackage({ dependencies: { react: '^16.0.0' } }, 'react')

    expect(getit).toBe(false)
  })
  it('returns false for lower minor versions using ~', () => {
    const getit = checkPackage({ dependencies: { react: '~16.0.0' } }, 'react')

    expect(getit).toBe(false)
  })
  it('returns false for lower major versions', () => {
    const getit = checkPackage({ dependencies: { react: '14.0.0' } }, 'react')

    expect(getit).toBe(false)
  })
  it('returns false for non-standard numeric versions', () => {
    const getit = checkPackage({ dependencies: { react: '14' } }, 'react')

    expect(getit).toBe(false)
  })
  it('returns true for higher minor versions using ^', () => {
    const getit = checkPackage({ dependencies: { react: '^17.15.0' } }, 'react')

    expect(getit).toBe(true)
  })
  it('returns true for higher minor versions using ~', () => {
    const getit = checkPackage({ dependencies: { react: '~16.15.0' } }, 'react')

    expect(getit).toBe(true)
  })
  it('returns true for equal versions', () => {
    const getit = checkPackage({ dependencies: { react: '16.14.0' } }, 'react')

    expect(getit).toBe(true)
  })
  it('returns true for higher minor versions', () => {
    const getit = checkPackage({ dependencies: { react: '16.16.0' } }, 'react')

    expect(getit).toBe(true)
  })
  /**
   * If a package is using tags, let it pass through (edge case)
   */
  it('returns true for non-standard versions', () => {
    const getit = checkPackage({ dependencies: { react: 'next' } }, 'react')

    expect(getit).toBe(true)
  })
})
