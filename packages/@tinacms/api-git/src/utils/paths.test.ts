/**

Copyright 2019 Forestry.io Inc

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

import * as path from 'path'

import { checkFilePathIsInParent } from './paths'

describe('checkFilePathIsInParent', () => {
  test('returns false if path not in repo', () => {
    const fileRelativePath = '../../../some-outside-file.json'
    const repoAbsPath = path.resolve('./')
    expect(checkFilePathIsInParent(fileRelativePath, repoAbsPath)).toBeFalsy()
  })

  test('returns true if path in repo', () => {
    const fileRelativePath = './some-inside-file.json'
    const repoAbsPath = path.resolve('./')
    expect(checkFilePathIsInParent(fileRelativePath, repoAbsPath)).toBeTruthy()
  })
})
