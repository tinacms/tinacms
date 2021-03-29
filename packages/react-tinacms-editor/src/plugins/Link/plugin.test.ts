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

import { HTTP_LINK_REGEX } from './util'

describe('link regex', () => {
  valid('http://google.com')
  valid('https://google.com')
  valid('http://www.google.com')
  valid('https://www.google.com')
  valid(
    'http://github.com/forestryio/kb#boards?repos=65822921,89267021,57069439&showPRs=false'
  )
  valid(
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp'
  )
  valid('https://www.example.com/foo/?bar=baz&inga=42&quux')
  valid('http://code.google.com/events/#&product=browser')
})

function valid(url: string) {
  it(`should match: ${url}`, () => {
    const result = url.match(HTTP_LINK_REGEX)
    const match = result ? result[0] : ''
    expect(match).toBe(url)
  })
}
