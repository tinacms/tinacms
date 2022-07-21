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

import {
  BinaryFilter,
  FilterCondition,
  OP,
  TernaryFilter,
  coerceFilterChainOperands,
  makeFilter,
  makeFilterChain,
  makeFilterSuffixes,
  makeKeyForField,
  INDEX_KEY_FIELD_SEPARATOR,
  makeStringEscaper,
  DEFAULT_NUMERIC_LPAD,
} from '.'

const escapeStr = makeStringEscaper(
  new RegExp(INDEX_KEY_FIELD_SEPARATOR, 'gm'),
  encodeURIComponent(INDEX_KEY_FIELD_SEPARATOR)
)

describe('datalayer store helper functions', () => {
  describe('makeKeyForField', () => {
    it('succeeds with non-datetime', () => {
      const expected = 'bar'
      const result = makeKeyForField(
        {
          fields: [
            {
              name: 'foo',
              type: 'string',
            },
          ],
        },
        { foo: expected },
        escapeStr
      )
      expect(result).toEqual(expected)
    })

    it('succeeds with long string', () => {
      const val =
        'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
      const expected = val.substring(0, 100)
      const result = makeKeyForField(
        {
          fields: [
            {
              name: 'foo',
              type: 'string',
            },
          ],
        },
        { foo: val },
        escapeStr
      )
      expect(result).toEqual(expected)
    })

    it('succeeds with datetime', () => {
      const now = new Date()
      const expected = String(now.getTime())
      const result = makeKeyForField(
        {
          fields: [
            {
              name: 'foo',
              type: 'datetime',
            },
          ],
        },
        { foo: now.toISOString() },
        escapeStr
      )
      expect(result).toEqual(expected)
    })

    it('fails with missing field', () => {
      const expected = null
      const result = makeKeyForField(
        {
          fields: [
            {
              name: 'foo',
              type: 'string',
            },
          ],
        },
        { bar: 'foo' },
        escapeStr
      )
      expect(result).toEqual(expected)
    })

    it('fails with null field', () => {
      const expected = null
      const result = makeKeyForField(
        {
          fields: [
            {
              name: 'foo',
              type: 'string',
            },
          ],
        },
        { foo: null },
        escapeStr
      )
      expect(result).toEqual(expected)
    })
  })

  describe('buildFilterSuffixes', () => {
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
        expect(makeFilterSuffixes([], singleBooleanIndexDefn)).toBeTruthy()
      })

      it('passes with single binary filter GT', () => {
        const expectedLeft = '1'
        const { left, right } = makeFilterSuffixes(
          [
            {
              pathExpression: 'id',
              rightOperand: Number(expectedLeft),
              operator: OP.GT,
              type: 'number',
            },
          ],
          singleNumericIndexDefn
        )
        expect(left).toEqual(expectedLeft)
        expect(right).toBeUndefined()
      })

      it('passes with single binary filter LT', () => {
        const expectedRight = '1'
        const { left, right } = makeFilterSuffixes(
          [
            {
              pathExpression: 'id',
              rightOperand: Number(expectedRight),
              operator: OP.LT,
              type: 'number',
            },
          ],
          singleNumericIndexDefn
        )
        expect(right).toEqual(expectedRight)
        expect(left).toBeUndefined()
      })

      it('passes with ternary filter', () => {
        const expectedLeft = '1'
        const expectedRight = '2'
        const { left, right } = makeFilterSuffixes(
          [
            {
              pathExpression: 'id',
              rightOperand: Number(expectedRight),
              leftOperand: Number(expectedLeft),
              rightOperator: OP.LT,
              leftOperator: OP.GT,
              type: 'number',
            },
          ],
          singleNumericIndexDefn
        )
        expect(right).toEqual(expectedRight)
        expect(left).toEqual(expectedLeft)
      })

      it('passes with single binary filter EQ', () => {
        const expectedLeft = '1'
        const { left, right } = makeFilterSuffixes(
          [
            {
              pathExpression: 'id',
              rightOperand: Number(expectedLeft),
              operator: OP.EQ,
              type: 'number',
            },
          ],
          singleNumericIndexDefn
        )
        expect(left).toEqual(expectedLeft)
        expect(right).toEqual(expectedLeft)
      })

      it('passes with multiple filter', () => {
        const { left, right } = makeFilterSuffixes(
          [
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
          publishedIdIndexDefn
        )
        expect(left).toEqual(`true${INDEX_KEY_FIELD_SEPARATOR}1`)
        expect(right).toBeUndefined()
      })
    })

    describe('for invalid params', () => {
      it('fails for unreferenced field', () => {
        expect(
          makeFilterSuffixes(
            [
              {
                pathExpression: 'id',
                rightOperand: 1,
                operator: OP.GT,
                type: 'number',
              },
            ],
            singleBooleanIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails for IN operator', () => {
        expect(
          makeFilterSuffixes(
            [
              {
                pathExpression: 'id',
                rightOperand: [1, 2, 3, 4],
                operator: OP.IN,
                type: 'number',
              },
            ],
            singleNumericIndexDefn
          )
        ).toBeFalsy()
      })

      it('lower order non-EQ operator', () => {
        expect(
          makeFilterSuffixes(
            [
              {
                pathExpression: 'published',
                rightOperand: true,
                operator: OP.GT,
                type: 'boolean',
              },
            ],
            publishedIdIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails for filter with gap', () => {
        expect(
          makeFilterSuffixes(
            [
              {
                pathExpression: 'id',
                rightOperand: 1,
                operator: OP.EQ,
                type: 'number',
              },
            ],
            publishedIdIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails with low order ternary filter', () => {
        expect(
          makeFilterSuffixes(
            [
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
                leftOperand: false,
                rightOperand: true,
                leftOperator: OP.GTE,
                rightOperator: OP.LTE,
                type: 'number',
              },
            ],
            idPublishedIndexDefn
          )
        ).toBeFalsy()
      })

      it('fails with low order non-equality operator', () => {
        expect(
          makeFilterSuffixes(
            [
              {
                pathExpression: 'id',
                rightOperand: 1,
                operator: OP.LT,
                type: 'number',
              },
              {
                pathExpression: 'published',
                rightOperand: true,
                operator: OP.LT,
                type: 'boolean',
              },
            ],
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
          pad: {
            fillString: '0',
            maxLength: DEFAULT_NUMERIC_LPAD,
          },
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
          pad: {
            fillString: '0',
            maxLength: DEFAULT_NUMERIC_LPAD,
          },
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

      it('numerical ternary filter with 0 as operand', () => {
        const pathExpression = 'foo.bar'
        const expected = {
          pathExpression,
          rightOperand: 0,
          leftOperand: 1,
          leftOperator: OP.GT,
          rightOperator: OP.LT,
          type: 'number',
          pad: {
            fillString: '0',
            maxLength: DEFAULT_NUMERIC_LPAD,
          },
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

      it('filters with datetime after', () => {
        const itemFilter = makeFilter({
          filterChain: [
            {
              pathExpression: 'date',
              rightOperand: 1623481200000,
              operator: OP.GT,
              type: 'datetime',
            },
          ],
        })
        expect(itemFilter({ date: '2021-04-03T20:30:00.000Z' })).toBeFalsy()
        expect(itemFilter({ date: '2021-07-03T20:30:00.000Z' })).toBeTruthy()
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
      const operand = 'foo'
      const expected: BinaryFilter = {
        pathExpression: 'title',
        rightOperand: operand.padStart(10, ' '),
        operator: OP.EQ,
        type: 'string',
        pad: {
          fillString: ' ',
          maxLength: 10,
        },
      }
      const coerced = coerceFilterChainOperands([expected], escapeStr)
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces string', () => {
      const expected: BinaryFilter = {
        pathExpression: 'title',
        rightOperand: 'foo',
        operator: OP.EQ,
        type: 'string',
      }
      const coerced = coerceFilterChainOperands([expected], escapeStr)
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces string[]', () => {
      const expected: BinaryFilter = {
        pathExpression: 'titles',
        rightOperand: ['foo', 'bar'],
        operator: OP.IN,
        type: 'string',
      }
      const coerced = coerceFilterChainOperands([expected], escapeStr)
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces string[] with padding', () => {
      const operand = ['foo', 'bar']
      const expected: BinaryFilter = {
        pathExpression: 'titles',
        rightOperand: operand.map((val) => val.padStart(10, ' ')),
        operator: OP.IN,
        type: 'string',
        pad: {
          fillString: ' ',
          maxLength: 10,
        },
      }
      const coerced = coerceFilterChainOperands([expected], escapeStr)
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces number', () => {
      const expected: BinaryFilter = {
        pathExpression: 'rating',
        rightOperand: 10,
        operator: OP.EQ,
        type: 'number',
      }
      const coerced = coerceFilterChainOperands([expected], escapeStr)
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces empty chain', () => {
      const coerced = coerceFilterChainOperands([], escapeStr)
      expect(coerced.length).toEqual(0)
    })

    it('coerces binary datetime', () => {
      const expected: BinaryFilter = {
        pathExpression: 'publishDate',
        rightOperand: 1317826080000,
        operator: OP.GT,
        type: 'datetime',
      }
      const coerced = coerceFilterChainOperands(
        [
          {
            ...expected,
            rightOperand: new Date(
              expected.rightOperand as number
            ).toISOString(),
          },
        ],
        escapeStr
      )

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
      const coerced = coerceFilterChainOperands(
        [
          {
            ...expected,
            rightOperand: [
              new Date(expected.rightOperand[0] as number).toISOString(),
            ],
          },
        ],
        escapeStr
      )

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
      const coerced = coerceFilterChainOperands(
        [
          {
            ...expected,
            rightOperand: new Date(
              expected.rightOperand as number
            ).toISOString(),
            leftOperand: new Date(expected.leftOperand as number).toISOString(),
          },
        ],
        escapeStr
      )

      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })

    it('coerces ternary string filter', () => {
      const expected: TernaryFilter = {
        pathExpression: 'title',
        leftOperand: 'foo',
        rightOperand: 'bar',
        leftOperator: OP.GT,
        rightOperator: OP.LT,
        type: 'string',
      }
      const coerced = coerceFilterChainOperands([expected], escapeStr)
      expect(coerced.length).toEqual(1)
      expect(coerced[0]).toEqual(expected)
    })
  })
})
