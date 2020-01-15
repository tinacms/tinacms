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
import { format } from './utils'

describe('format', () => {
  it('returns empty string for no names defined', () => {
    expect(format(undefined, undefined, undefined)).toEqual('')
  })

  it('formats just first names', () => {
    expect(format('Joseph', undefined, undefined)).toEqual('Joseph')
  })

  it('formats first and last names', () => {
    expect(format('Joseph', undefined, 'Publique')).toEqual('Joseph Publique')
  })

  it('formats first, middle and last names', () => {
    expect(format('Joseph', 'Quincy', 'Publique')).toEqual(
      'Joseph Quincy Publique'
    )
  })
})
