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

import { generateGqlScript, extendNextScripts } from './script-helpers'

describe('generateGqlScript', () => {
  it('wraps original script correctly', () => {
    const newScript = generateGqlScript('next dev -p 3000')

    expect(newScript).toEqual('tinacms dev -c "next dev -p 3000"')
  })
})

describe('extendNextScripts', () => {
  describe('with all existing scrpts', () => {
    it('returns new scripts correctly', () => {
      const newScripts = extendNextScripts({
        foo: 'bar',
        dev: 'next dev -p 3000',
        build: 'next build -p 3000',
        start: 'next start -p 3000',
      })

      expect(newScripts).toEqual({
        foo: 'bar',
        dev: 'tinacms dev -c "next dev -p 3000"',
        build: 'tinacms build && next build -p 3000',
        start: 'tinacms build && next start -p 3000',
      })
    })
  })

  describe('with missing existing scrpts', () => {
    it('returns new scripts correctly', () => {
      const newScripts = extendNextScripts({
        foo: 'bar',
      })

      expect(newScripts).toEqual({
        foo: 'bar',
        dev: 'tinacms dev -c "next dev"',
        build: 'tinacms build && next build',
        start: 'tinacms build && next start',
      })
    })
  })
})
