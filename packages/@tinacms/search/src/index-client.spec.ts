import { queryToSearchIndexQuery } from './index-client'

describe('queryToSearchIndexQuery', () => {
  it('should return a query object for simple query', () => {
    expect(queryToSearchIndexQuery('foo')).toEqual({ AND: ['foo'] })
  })

  it('should return a query object for a complex query', () => {
    expect(queryToSearchIndexQuery('foo bar')).toEqual({ AND: ['foo', 'bar'] })
  })

  it('should request a query object for a boolean expression with AND', () => {
    expect(queryToSearchIndexQuery('foo AND bar')).toEqual({
      AND: ['foo', 'bar'],
    })
  })
})
