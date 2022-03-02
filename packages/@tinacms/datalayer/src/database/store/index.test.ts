import { makeFilterChain, OP, validateQueryParams } from '.'

const namespace = 'posts'

describe('datalayer store', () => {
  describe('validateQueryParams', () => {
    const indexName = 'fooIdx'
    const singleBooleanIndexDefn = {
      namespace,
      fields: [
        {
          name: 'published',
        },
      ],
    }
    const singleNumericIndexDefn = {
      namespace,
      fields: [
        {
          name: 'id',
        },
      ],
    }
    const publishedIdIndexDefn = {
      namespace,
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
      namespace,
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
        expect(() => {
          validateQueryParams({}, indexName, singleBooleanIndexDefn)
        }).not.toThrow()
      })

      it('passes with single binary filter', () => {
        expect(() => {
          validateQueryParams(
            {
              filterChain: [
                {
                  field: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                },
              ],
            },
            indexName,
            singleNumericIndexDefn
          )
        }).not.toThrow()
      })

      it('passes with multiple filter', () => {
        expect(() => {
          validateQueryParams(
            {
              filterChain: [
                {
                  field: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                },
                {
                  field: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                },
              ],
            },
            indexName,
            publishedIdIndexDefn
          )
        }).not.toThrow()
      })
    })

    describe('for invalid params', () => {
      it('fails for unreferenced field', () => {
        expect(() => {
          validateQueryParams(
            {
              filterChain: [
                {
                  field: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                },
              ],
            },

            indexName,
            singleBooleanIndexDefn
          )
        }).toThrowErrorMatchingInlineSnapshot(
          `"invalid filter on index 'fooIdx' - received: 'id', expected one of: [published]"`
        )
      })

      it('fails for mis-ordered fields', () => {
        expect(() => {
          validateQueryParams(
            {
              filterChain: [
                {
                  field: 'id',
                  rightOperand: 1,
                  operator: OP.GT,
                },
                {
                  field: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                },
              ],
            },

            indexName,
            publishedIdIndexDefn
          )
        }).toThrowErrorMatchingInlineSnapshot(
          `"expected filter 'published' on index 'fooIdx' at position 0 but found 'id'"`
        )
      })

      it('fails with low order ternary filter', () => {
        expect(() => {
          validateQueryParams(
            {
              filterChain: [
                {
                  field: 'id',
                  rightOperand: 1,
                  leftOperand: 2,
                  leftOperator: OP.GTE,
                  rightOperator: OP.LTE,
                },

                {
                  field: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                },
              ],
            },

            indexName,
            idPublishedIndexDefn
          )
        }).toThrowErrorMatchingInlineSnapshot(
          `"ternary filter not supported on index 'fooIdx for field 'id"`
        )
      })

      it('fails with low order non-equality operator', () => {
        expect(() => {
          validateQueryParams(
            {
              filterChain: [
                {
                  field: 'id',
                  rightOperand: 1,
                  operator: OP.LT,
                },

                {
                  field: 'published',
                  rightOperand: true,
                  operator: OP.EQ,
                },
              ],
            },

            indexName,
            idPublishedIndexDefn
          )
        }).toThrowErrorMatchingInlineSnapshot(
          `"specified filter operator 'lt' only supported for highest order field in index 'fooIdx'"`
        )
      })
    })
  })

  describe('makeFilterChain', () => {
    describe('single column', () => {
      it('binary filter', () => {
        for (let op in OP) {
          const expected = {
            field: 'published',
            rightOperand: true,
            operator: OP[op],
          }
          let filterOp = op.toLowerCase()
          if (filterOp === 'begins_with') {
            filterOp = 'startsWith'
          }
          const filterChain = makeFilterChain({
            filter: {
              [expected.field]: {
                [filterOp]: expected.rightOperand,
              },
            },
            index: {
              namespace,
              fields: [
                {
                  name: 'published',
                },
              ],
            },
          })

          expect(filterChain).toBeDefined()
          expect(filterChain).toHaveLength(1)
          expect(filterChain[0]).toEqual(expected)
        }
      })

      it('binary filter with bad op', () => {
        expect(() => {
          makeFilterChain({
            filter: {
              ['published']: {
                ['zippy']: 'happy',
              },
            },

            index: {
              namespace,
              fields: [
                {
                  name: 'published',
                },
              ],
            },
          })
        }).toThrowErrorMatchingInlineSnapshot(
          `"unsupported filter condition: 'zippy'"`
        )
      })

      it('ternary filter', () => {
        const expected = {
          field: 'date',
          rightOperand: '2021-03-12T07:00:00.000Z',
          leftOperand: '2021-04-12T07:00:00.000Z',
          leftOperator: OP.GT,
          rightOperator: OP.LT,
        }
        const filterChain = makeFilterChain({
          filter: {
            [expected.field]: {
              before: expected.rightOperand,
              after: expected.leftOperand,
            },
          },
          index: {
            namespace,
            fields: [
              {
                name: 'date',
              },
            ],
          },
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(1)
        expect(filterChain[0]).toEqual(expected)
      })
    })

    describe('multi-column', () => {
      it('binary filter', () => {
        const expectedFilter1 = {
          field: 'published',
          rightOperand: true,
          operator: OP.EQ,
        }
        const expectedFilter2 = {
          field: 'title',
          rightOperand: 'my title',
          operator: OP.BEGINS_WITH,
        }
        const filterChain = makeFilterChain({
          filter: {
            [expectedFilter1.field]: {
              eq: expectedFilter1.rightOperand,
            },
            [expectedFilter2.field]: {
              startsWith: expectedFilter2.rightOperand,
            },
          },
          index: {
            namespace,
            fields: [
              {
                name: 'published',
              },
              {
                name: 'title',
              },
            ],
          },
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(2)
        expect(filterChain[0]).toEqual(expectedFilter1)
        expect(filterChain[1]).toEqual(expectedFilter2)
      })

      it('ternary filter', () => {
        const expectedFilter1 = {
          field: 'published',
          rightOperand: false,
          operator: OP.EQ,
        }
        const expectedFilter2 = {
          field: 'date',
          rightOperand: '2021-03-12T07:00:00.000Z',
          leftOperand: '2021-04-12T07:00:00.000Z',
          leftOperator: OP.GT,
          rightOperator: OP.LT,
        }
        const filterChain = makeFilterChain({
          filter: {
            [expectedFilter1.field]: {
              eq: expectedFilter1.rightOperand,
            },
            [expectedFilter2.field]: {
              after: expectedFilter2.leftOperand,
              before: expectedFilter2.rightOperand,
            },
          },
          index: {
            namespace,
            fields: [
              {
                name: 'published',
              },
              {
                name: 'date',
              },
            ],
          },
        })

        expect(filterChain).toBeDefined()
        expect(filterChain).toHaveLength(2)
        expect(filterChain[0]).toEqual(expectedFilter1)
        expect(filterChain[1]).toEqual(expectedFilter2)
      })
    })

    it('fails with too many conditions', () => {
      expect(() => {
        makeFilterChain({
          filter: {
            published: {
              eq: true,
              gt: 1,
              lt: 2,
            },
          },

          index: {
            namespace,
            fields: [
              {
                name: 'published',
              },
            ],
          },
        })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Filter on field 'published' supports at most two conditions: 'eq, gt, lt'"`
      )
    })

    it('fails with invalid combination of conditions', () => {
      expect(() => {
        makeFilterChain({
          filter: {
            published: {
              eq: true,
              gt: 1,
            },
          },

          index: {
            namespace,
            fields: [
              {
                name: 'published',
              },
            ],
          },
        })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Filter on field 'published' has invalid combination of conditions: 'eq, gt'"`
      )
    })
  })
})
