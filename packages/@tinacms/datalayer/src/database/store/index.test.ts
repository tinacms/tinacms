import {
  FilterCondition,
  makeFilterChain,
  OP,
  isIndexed,
  makeFilter,
  coerceFilterChainOperands,
  TernaryFilter,
  BinaryFilter,
} from '.'

describe('datalayer store', () => {
  describe('validateQueryParams', () => {
    const singleBooleanIndexDefn = {
      fields: [
        {
          name: 'published',
        },
      ],
    }
    const singleNumericIndexDefn = {
      fields: [
        {
          name: 'id',
        },
      ],
    }
    const publishedIdIndexDefn = {
      fields: [
        {
          name: 'published',
        },
        {
          name: 'id',
        },
      ],
    }
    const idPublishedIndexDefn = {
      fields: [
        {
          name: 'id',
        },
        {
          name: 'published',
        },
      ],
    }
    describe('for valid params', () => {
      it('passes without filterChain', () => {
        expect(isIndexed({}, singleBooleanIndexDefn)).toBeTruthy()
      })

      it('passes with single binary filter', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                  type: 'number',
                },
              ],
            },
            singleNumericIndexDefn
          )
        ).toBeTruthy()
      })

      it('passes with multiple filter', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                  type: 'boolean',
                },
                {
                  pathExpression: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                  type: 'number',
                },
              ],
            },
            publishedIdIndexDefn
          )
        ).toBeTruthy()
      })
    })

    describe('for invalid params', () => {
      it('fails for unreferenced field', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                  type: 'number',
                },
              ],
            },
            singleBooleanIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails for IN operator', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'id',
                  rightOperand: [1, 2, 3, 4],
                  operator: OP.IN,
                  type: 'number',
                },
              ],
            },
            singleNumericIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails for mis-ordered fields', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                  type: 'number',
                },
                {
                  pathExpression: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                  type: 'number',
                },
              ],
            },
            publishedIdIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails with low order ternary filter', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'id',
                  rightOperand: 1,
                  leftOperand: 2,
                  leftOperator: OP.GTE,
                  rightOperator: OP.LTE,
                  type: 'number',
                },

                {
                  pathExpression: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                  type: 'number',
                },
              ],
            },
            idPublishedIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails with low order non-equality operator', () => {
        expect(
          isIndexed(
            {
              filterChain: [
                {
                  pathExpression: 'id',
                  rightOperand: 1,
                  operator: OP.LT,
                  type: 'number',
                },
                {
                  pathExpression: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                  type: 'boolean',
                },
              ],
            },
            idPublishedIndexDefn
          )
        ).toBeFalsy()
      })
    })
  })

  describe('makeFilterChain', () => {
    describe('single column', () => {
      it('binary filter', () => {
        const pathExpression = 'foo.bar'
        for (const op in OP) {
          const expected = {
            pathExpression,
            rightOperand: true,
            operator: OP[op],
            type: 'boolean',
          }
          const filterCondition: FilterCondition = {
            filterExpression: {
              [expected.operator === OP.STARTS_WITH
                ? 'startsWith'
                : expected.operator.toLowerCase()]: expected.rightOperand,
              _type: expected.type,
            },
            filterPath: pathExpression,
          }
          const filterChain = makeFilterChain({
            conditions: [filterCondition],
          })

          expect(filterChain).toBeDefined()
          expect(filterChain).toHaveLength(1)
          expect(filterChain[0]).toEqual(expected)
        }
      })

      it('binary filter after', () => {
        const pathExpression = 'foo.bar'
        const expected = {
          pathExpression,
          rightOperand: 5,
          operator: OP.GT,
          type: 'number',
        }
        const filterCondition: FilterCondition = {
          filterExpression: {
            after: expected.rightOperand,
            _type: expected.type,
          },
          filterPath: pathExpression,
        }
        const filterChain = makeFilterChain({
          conditions: [filterCondition],
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(1)
        expect(filterChain[0]).toEqual(expected)
      })

      it('binary filter before', () => {
        const pathExpression = 'foo.bar'
        const expected = {
          pathExpression,
          rightOperand: 5,
          operator: OP.LT,
          type: 'number',
        }
        const filterCondition: FilterCondition = {
          filterExpression: {
            before: expected.rightOperand,
            _type: expected.type,
          },
          filterPath: pathExpression,
        }
        const filterChain = makeFilterChain({
          conditions: [filterCondition],
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(1)
        expect(filterChain[0]).toEqual(expected)
      })

      it('binary filter with bad op', () => {
        const pathExpression = 'foo.bar'
        const filterCondition: FilterCondition = {
          filterExpression: {
            foo: 'bar',
            _type: 'string',
          },
          filterPath: pathExpression,
        }
        expect(() => {
          makeFilterChain({
            conditions: [filterCondition],
          })
        }).toThrowErrorMatchingInlineSnapshot(
          `"unsupported filter condition: 'foo'"`
        )
      })

      it('ternary filter RL', () => {
        const pathExpression = 'foo.bar'
        const expected = {
          pathExpression,
          rightOperand: '2021-03-12T07:00:00.000Z',
          leftOperand: '2021-04-12T07:00:00.000Z',
          leftOperator: OP.GT,
          rightOperator: OP.LT,
          type: 'datetime',
        }
        const filterCondition: FilterCondition = {
          filterExpression: {
            [expected.rightOperator.toLowerCase()]: expected.rightOperand,
            [expected.leftOperator.toLowerCase()]: expected.leftOperand,
            _type: expected.type,
          },
          filterPath: pathExpression,
        }
        const filterChain = makeFilterChain({
          conditions: [filterCondition],
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(1)
        expect(filterChain[0]).toEqual(expected)
      })

      it('ternary filter LR', () => {
        const pathExpression = 'foo.bar'
        const expected = {
          pathExpression,
          rightOperand: '2021-03-12T07:00:00.000Z',
          leftOperand: '2021-04-12T07:00:00.000Z',
          leftOperator: OP.GT,
          rightOperator: OP.LT,
          type: 'datetime',
        }
        const filterCondition: FilterCondition = {
          filterExpression: {
            [expected.leftOperator.toLowerCase()]: expected.leftOperand,
            [expected.rightOperator.toLowerCase()]: expected.rightOperand,
            _type: expected.type,
          },
          filterPath: pathExpression,
        }
        const filterChain = makeFilterChain({
          conditions: [filterCondition],
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(1)
        expect(filterChain[0]).toEqual(expected)
      })

      it('no conditions', () => {
        const filterChain = makeFilterChain({ conditions: undefined })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(0)
      })
    })

    it('fails with too many conditions', () => {
      expect(() => {
        const pathExpression = 'foo.bar'
        const filterCondition: FilterCondition = {
          filterExpression: {
            eq: true,
            gt: 1,
            lt: 2,
            _type: 'boolean',
          },

          filterPath: pathExpression,
        }

        makeFilterChain({
          conditions: [filterCondition],
        })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Unexpected keys: [lt] in filter expression"`
      )
    })

    it('fails with invalid combination of conditions', () => {
      expect(() => {
        const pathExpression = 'foo.bar'
        const filterCondition: FilterCondition = {
          filterExpression: {
            eq: true,
            gt: 1,
            _type: 'boolean',
          },

          filterPath: pathExpression,
        }

        makeFilterChain({
          conditions: [filterCondition],
        })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Filter on field 'foo.bar' has invalid combination of conditions: 'eq, gt'"`
      )
    })
  })

  describe('makeFilter', () => {
    describe('compound field filter', () => {
      describe('binary + ternary', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'rating',
              rightOperand: 5,
              leftOperand: 3,
              leftOperator: OP.GT,
              rightOperator: OP.LT,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ published: true, rating: 4 })).toBeTruthy()
        expect(itemFilter({ published: true, rating: 5 })).toBeFalsy()
        expect(itemFilter({ published: false, rating: 4 })).toBeFalsy()
      })
    })

    describe('single field filter', () => {
      describe('binary', () => {
        it('filters with simple boolean EQ', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'published',
                rightOperand: true,
                operator: OP.EQ,
                type: 'boolean',
              },
            ],
          })
          expect(itemFilter({ published: true })).toBeTruthy()
          expect(itemFilter({ published: false })).toBeFalsy()
        })

        it('filters with nested boolean EQ', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'author.works.published',
                rightOperand: true,
                operator: OP.EQ,
                type: 'boolean',
              },
            ],
          })
          expect(
            itemFilter({ author: { works: { published: true } } })
          ).toBeTruthy()
          expect(
            itemFilter({ author: { works: { published: false } } })
          ).toBeFalsy()
        })

        it('filters with simple boolean EQ missing value', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'published',
                rightOperand: true,
                operator: OP.EQ,
                type: 'boolean',
              },
            ],
          })
          expect(itemFilter({ foo: true })).toBeFalsy()
          expect(itemFilter({ foo: false })).toBeFalsy()
        })

        it('invalid operator', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'published',
                rightOperand: true,
                operator: 'foo' as any,
                type: 'boolean',
              },
            ],
          })
          expect(() => {
            itemFilter({ published: true })
          }).toThrowErrorMatchingInlineSnapshot(`"unexpected operator foo"`)
        })

        it('bad dataType', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'published',
                rightOperand: true,
                operator: OP.EQ,
                type: 'foo',
              },
            ],
          })
          expect(() => {
            itemFilter({ published: true })
          }).toThrowErrorMatchingInlineSnapshot(`"Unexpected datatype foo"`)
        })

        it('filters with simple string IN', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'title',
                rightOperand: ['happy mice'],
                operator: OP.IN,
                type: 'string',
              },
            ],
          })
          expect(itemFilter({ title: 'happy mice' })).toBeTruthy()
          expect(itemFilter({ title: 'bad badgers' })).toBeFalsy()
        })

        it('filters with simple string STARTS_WITH', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'title',
                rightOperand: 'happy',
                operator: OP.STARTS_WITH,
                type: 'string',
              },
            ],
          })
          expect(itemFilter({ title: 'happy mice' })).toBeTruthy()
          expect(itemFilter({ title: 'bad badgers' })).toBeFalsy()
        })

        it('filters with simple numeric GT', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'rating',
                rightOperand: 3,
                operator: OP.GT,
                type: 'number',
              },
            ],
          })
          expect(itemFilter({ rating: 5 })).toBeTruthy()
          expect(itemFilter({ rating: 2 })).toBeFalsy()
        })

        it('filters with simple numeric GTE', () => {
          const itemFilter = makeFilter({
            filterChain: [
              {
                pathExpression: 'rating',
                rightOperand: 3,
                operator: OP.GTE,
                type: 'number',
              },
            ],
          })
          expect(itemFilter({ rating: 3 })).toBeTruthy()
          expect(itemFilter({ rating: 2 })).toBeFalsy()
        })
      })

      it('filters with simple numeric LT', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'rating',
              rightOperand: 3,
              operator: OP.LT,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ rating: 2 })).toBeTruthy()
        expect(itemFilter({ rating: 5 })).toBeFalsy()
      })

      it('filters with simple numeric LTE', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'rating',
              rightOperand: 3,
              operator: OP.LTE,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ rating: 3 })).toBeTruthy()
        expect(itemFilter({ rating: 5 })).toBeFalsy()
      })
    })

    describe('ternary', () => {
      it('filters with simple a < b < c', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'rating',
              rightOperand: 5,
              leftOperand: 3,
              leftOperator: OP.GT,
              rightOperator: OP.LT,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ rating: 4 })).toBeTruthy()
        expect(itemFilter({ rating: 1 })).toBeFalsy()
        expect(itemFilter({ rating: 6 })).toBeFalsy()
      })

      it('filters with simple a <= b < c', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'rating',
              rightOperand: 5,
              leftOperand: 3,
              leftOperator: OP.GTE,
              rightOperator: OP.LT,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ rating: 3 })).toBeTruthy()
        expect(itemFilter({ rating: 1 })).toBeFalsy()
        expect(itemFilter({ rating: 6 })).toBeFalsy()
      })

      it('filters with simple a < b <= c', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'rating',
              rightOperand: 5,
              leftOperand: 3,
              leftOperator: OP.GT,
              rightOperator: OP.LTE,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ rating: 5 })).toBeTruthy()
        expect(itemFilter({ rating: 1 })).toBeFalsy()
        expect(itemFilter({ rating: 6 })).toBeFalsy()
      })

      it('filters with simple a <= b <= c', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'rating',
              rightOperand: 5,
              leftOperand: 3,
              leftOperator: OP.GTE,
              rightOperator: OP.LTE,
              type: 'number',
            },
          ],
        })
        expect(itemFilter({ rating: 3 })).toBeTruthy()
        expect(itemFilter({ rating: 5 })).toBeTruthy()
        expect(itemFilter({ rating: 1 })).toBeFalsy()
        expect(itemFilter({ rating: 6 })).toBeFalsy()
      })
    })
  })

  describe('coerceFilterChainOperands', () => {
    it('coerces string', () => {
      const expected: BinaryFilter = {
        pathExpression: 'title',
        rightOperand: 'foo',
        operator: OP.EQ,
        type: 'string',
      }
      const coerced = coerceFilterChainOperands([expected])
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces empty chain', () => {
      const coerced = coerceFilterChainOperands([])
      expect(coerced.length).toEqual(0)
    })

    it('coerces binary datetime', () => {
      const expected: BinaryFilter = {
        pathExpression: 'publishDate',
        rightOperand: 1317826080000,
        operator: OP.GT,
        type: 'datetime',
      }
      const coerced = coerceFilterChainOperands([
        {
          ...expected,
          rightOperand: new Date(expected.rightOperand as number).toISOString(),
        },
      ])

      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces binary datetime array', () => {
      const expected: BinaryFilter = {
        pathExpression: 'publishDate',
        rightOperand: [1317826080000],
        operator: OP.IN,
        type: 'datetime',
      }
      const coerced = coerceFilterChainOperands([
        {
          ...expected,
          rightOperand: [
            new Date(expected.rightOperand[0] as number).toISOString(),
          ],
        },
      ])

      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces ternary datetime', () => {
      const expected: TernaryFilter = {
        pathExpression: 'publishDate',
        leftOperand: 1317826080000,
        rightOperand: 1317856080000,
        leftOperator: OP.GT,
        rightOperator: OP.LT,
        type: 'datetime',
      }
      const coerced = coerceFilterChainOperands([
        {
          ...expected,
          rightOperand: new Date(expected.rightOperand as number).toISOString(),
          leftOperand: new Date(expected.leftOperand as number).toISOString(),
        },
      ])

      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })
  })
})
