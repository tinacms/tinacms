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

import { format, parse } from './dateFormat'

import moment from 'moment'

describe('date format', () => {
  describe('format', () => {
    const dateString = '03 02 1972'
    const dateFormat = 'MM DD YYYY'

    describe('with moment input', () => {
      it('returns properly formatted string', () => {
        const date = moment(dateString, dateFormat)
        const result = format(date, 'date', { dateFormat: 'MM YYYY' })
        expect(result).toEqual('03 1972')
      })
    })

    describe('with date string input', () => {
      it('returns properly formatted string', () => {
        const dateString = '03 02 1972'
        const result = format(dateString, 'date', { dateFormat: 'MM YYYY' })
        expect(result).toEqual('03 1972')
      })
    })

    describe('with non-date string input', () => {
      it('returns input string', () => {
        const result = format('hello!', 'date', { dateFormat: 'MM YYYY' })
        expect(result).toEqual('hello!')
      })
    })
  })

  describe('parse', () => {
    const dateString = '07 02 1972'
    const dateFormat = 'MM DD YYYY'

    describe('with moment input', () => {
      it('returns correct date', () => {
        const date = moment(dateString, dateFormat)
        const result = parse(date, 'date', { dateFormat: 'MM YYYY' }) as Date

        console.log('mmm ' + result)
        console.log('month: ' + result.getMonth())
        expect(result.getMonth()).toEqual(6)
        expect(result.getFullYear()).toEqual(1972)
      })
    })

    describe('with date string input', () => {
      it('returns correct date', () => {
        const result = parse('07/02/1992', 'date', {
          dateFormat: 'MM/DD/YYYY', // should match date
        }) as Date

        expect(result.getMonth()).toEqual(6)
        expect(result.getFullYear()).toEqual(1992)
      })
    })

    describe('with non-date string input', () => {
      it('returns input string', () => {
        const result = parse('hello!', 'date', { dateFormat: 'MM YYYY' })
        expect(result).toEqual('hello!')
      })
    })
  })
})
