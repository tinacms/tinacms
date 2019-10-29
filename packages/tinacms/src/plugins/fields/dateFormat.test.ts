import { format, parse } from './dateFormat'

import * as _moment from 'moment'
const moment = _moment //https://github.com/jvandemo/generator-angular2-library/issues/221#issuecomment-355945207

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
        const dateFormat = 'MM DD YYYY'
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
