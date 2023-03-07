/**



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
        const result = moment(
          parse(date, 'date', { dateFormat: 'MM YYYY' })
        ).toDate() as Date

        console.log('mmm ' + result)
        console.log('month: ' + result.getMonth())
        expect(result.getMonth()).toEqual(6)
        expect(result.getFullYear()).toEqual(1972)
      })
    })

    describe('with date string input', () => {
      it('returns correct date', () => {
        const result = moment(
          parse('07/02/1992', 'date', {
            dateFormat: 'MM/DD/YYYY', // should match date
          })
        ).toDate() as Date

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
