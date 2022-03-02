import {LevelStore} from './level'
import {IndexDefinition, OP} from './index'

const titlePrefix = 'Document'
const namespace = 'posts'
const dateAscSort = (a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime()
const dateDescSort = (a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime()
const titleAscSort = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title)
const titleDescSort = (a: { title: string }, b: { title: string }) => b.title.localeCompare(a.title)
const idAscSort = (a: { id: number }, b: { id: number }) => a.id - b.id
const idDescSort = (a: { id: number }, b: { id: number }) => b.id - a.id
const partition = (array: any, n: number): any[] =>
    array.length ? [array.splice(0, n)].concat(partition(array, n)) : []
const validateResult = (result: any, expectedDocs: any[], limit?: number) => {
    expect(result).toBeDefined()
    expect(result.edges).toHaveLength(limit ? limit : expectedDocs.length)
    for (const [i, expectedDoc] of Object.entries(expectedDocs)) {
        if (limit && Number(i) >= limit) {
            break
        }

        expect(result.edges[i].node).toEqual(expectedDoc)
    }
}

describe('LevelDB store', () => {
    let mockHydrator: (path: string) => Promise<any>
    let mockDocuments: Record<string, {
        title: string
        published: boolean
        date: string
        id: number
    }>
    let mockIndexes: Record<string, IndexDefinition>
    beforeEach(() => {
        mockHydrator = async (path) => Promise.resolve(mockDocuments[path])
        mockDocuments = {
            'posts/document_1': {
                title: `${titlePrefix} 1`,
                published: true,
                date: '2021-04-14T07:00:00.000Z',
                id: 0
            }, 'posts/document_2': {
                title: `${titlePrefix} 2`,
                published: true,
                date: '2021-04-13T07:00:00.000Z',
                id: 1
            }, 'posts/document_3': {
                title: `${titlePrefix} 3`,
                published: true,
                date: '2021-04-12T07:00:00.000Z',
                id: 2
            }, 'posts/document_4': {
                title: `${titlePrefix} 4`,
                published: false,
                date: '2021-04-11T07:00:00.000Z',
                id: 3
            }
        }
        mockIndexes = {
            titleIdx: {
                namespace,
                fields: [{
                    type: 'string',
                    name: 'title',
                    default: ''
                }]
            },
            dateIdx: {
                namespace,
                fields: [{
                    type: 'datetime',
                    name: 'date',
                    default: ''
                }]
            },
            idIdx: {
                namespace,
                fields: [{
                    type: 'number',
                    name: 'id',
                    default: ''
                }]
            },
            publishedDateIdx: {
                namespace: 'posts',
                fields: [{
                    type: 'boolean',
                    name: 'published',
                    default: false
                }, {
                    type: 'datetime',
                    name: 'date',
                    default: ''
                }]
            }
        }
    })

    describe('seed', () => {
        it('succeeds', async () => {
            const store = new LevelStore('', true)
            for (const path of Object.keys(mockDocuments)) {
                await store.seed(path, mockDocuments[path], {indexDefinitions: mockIndexes})
            }
        })

        it('fails with duplicates', async () => {
            const store = new LevelStore('', true)
            for (const [path, document] of Object.entries(mockDocuments)) {
                if (path === 'posts/document_1' || path === 'posts/document_4') {
                    await store.seed(path, document, {
                        indexDefinitions: {
                            published: {
                                namespace: 'posts',
                                fields: [{
                                    type: 'boolean',
                                    name: 'published',
                                    default: false
                                }]
                            }
                        }
                    })
                } else {
                    await expect(store.seed(path, document, {
                        indexDefinitions: {
                            published: {
                                namespace: 'posts',
                                fields: [{
                                    type: 'boolean',
                                    name: 'published',
                                    default: false
                                }]
                            }
                        }
                    })).rejects.toThrowError('')
                }
            }
        })
    })

    describe('query', () => {
        let store: LevelStore
        beforeEach(async () => {
            store = new LevelStore('', true)
            for (const path of Object.keys(mockDocuments)) {
                await store.seed(path, mockDocuments[path], {indexDefinitions: mockIndexes})
            }
        })

        describe('single string column index with filter', () => {
            it('sorts by title asc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(titleAscSort)
                const first = 3
                const result = await store.query({
                    first,
                    index: 'titleIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, first)
            })

            it('sorts by title desc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(titleDescSort)
                const last = 3
                const result = await store.query({
                    last,
                    index: 'titleIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, last)
            })

            it('filters with equals string', async () => {
                const path = 'posts/document_1'
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'title',
                            rightOperand: mockDocuments[path].title,
                            operator: OP.EQ
                        }],
                    index: 'titleIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(mockDocuments[path])
            })

            it('filters with begins with string', async () => {
                const first = 2
                // add document with different title prefix
                const path = 'posts/document_x'
                mockDocuments[path] = {
                    title: '1 document x',
                    published: true,
                    date: '2021-04-15T07:00:00.000Z',
                    id: Object.keys(mockDocuments).length + 1
                }
                await store.seed(path, mockDocuments[path], {indexDefinitions: mockIndexes})
                const expectedDocs = Object.values(mockDocuments).sort(titleAscSort).filter(doc => doc.title.startsWith(titlePrefix))
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'title',
                            rightOperand: titlePrefix,
                            operator: OP.BEGINS_WITH
                        }],
                    first,
                    index: 'titleIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, first)
            })

            it('filters with invalid operator', async () => {
                const path = 'posts/document_1'
                await expect(store.query({
                    filterChain: [
                        {
                            field: 'title',
                            rightOperand: mockDocuments[path].title,
                            operator: 'ends_with' as any
                        }],
                    index: 'titleIdx'
                }, mockHydrator)).rejects.toThrowError('unexpected operator ends_with')
            })
        })

        describe('single datetime column index with filter', () => {
            it('sorts by date asc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(dateAscSort)
                const first = 3
                const result = await store.query({
                    first,
                    index: 'dateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, first)
            })

            it('sorts by date desc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(dateDescSort)
                const last = 3
                const result = await store.query({
                    last,
                    index: 'dateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, last)
            })

            it('filters by equal', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'date',
                            rightOperand: expectedDocs[0].date,
                            operator: OP.EQ
                        }],
                    index: 'dateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(expectedDocs[0])
            })

            it('filters by GT', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(dateAscSort)
                const cutoffDate = expectedDocs[0].date
                expectedDocs = expectedDocs.filter(doc => new Date(doc.date).getTime() > new Date(cutoffDate).getTime())
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'date',
                            rightOperand: cutoffDate,
                            operator: OP.GT
                        }],
                    index: 'dateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('filters by GTE', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(dateAscSort)
                const cutoffDate = expectedDocs[1].date
                expectedDocs = expectedDocs.filter(doc => new Date(doc.date).getTime() >= new Date(cutoffDate).getTime())
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'date',
                            rightOperand: cutoffDate,
                            operator: OP.GTE
                        }],
                    index: 'dateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('filters by LT', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(dateAscSort)
                const cutoffDate = expectedDocs[1].date
                expectedDocs = expectedDocs.filter(doc => new Date(doc.date).getTime() < new Date(cutoffDate).getTime())
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'date',
                            rightOperand: cutoffDate,
                            operator: OP.LT
                        }],
                    index: 'dateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('filters by LTE', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(dateAscSort)
                const cutoffDate = expectedDocs[1].date
                expectedDocs = expectedDocs.filter(doc => new Date(doc.date).getTime() <= new Date(cutoffDate).getTime())
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'date',
                            rightOperand: cutoffDate,
                            operator: OP.LTE
                        }],
                    index: 'dateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })
        })

        describe('single number column index with filter', () => {
            it('sorts by id asc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const first = 3
                const result = await store.query({
                    first,
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, first)
            })

            it('sorts by id desc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(idDescSort)
                const last = 3
                const result = await store.query({
                    last,
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs, last)
            })

            it('paginates asc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const first = 2
                const pages = partition(expectedDocs, 2)
                let cursor: string
                for ( const page of pages) {
                    const query = {
                        first,
                        index: 'idIdx'
                    }

                    if (cursor) {
                        query['after'] = cursor
                    }

                    const result = await store.query(query, mockHydrator)
                    cursor = result.pageInfo.endCursor

                    validateResult(result, page)
                }
            })

            it('paginates desc', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(idDescSort)
                const last = 2
                const pages = partition(expectedDocs, 2)
                let cursor: string
                for ( const page of pages) {
                    const query = {
                        last,
                        index: 'idIdx'
                    }

                    if (cursor) {
                        query['before'] = cursor
                    }

                    const result = await store.query(query, mockHydrator)
                    cursor = result.pageInfo.endCursor

                    validateResult(result, page)
                }
            })

            it('filters by equal', async () => {
                const expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            rightOperand: expectedDocs[0].id,
                            operator: OP.EQ
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(expectedDocs[0])
            })

            it('filters by GT', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const cutoffId = expectedDocs[0].id
                expectedDocs = expectedDocs.filter(doc => doc.id > cutoffId)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            rightOperand: cutoffId,
                            operator: OP.GT
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('filters by GTE', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const cutoffId = expectedDocs[1].id
                expectedDocs = expectedDocs.filter(doc => doc.id >= cutoffId)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            rightOperand: cutoffId,
                            operator: OP.GTE
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('filters by LT', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const cutoffId = expectedDocs[1].id
                expectedDocs = expectedDocs.filter(doc => doc.id < cutoffId)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            rightOperand: cutoffId,
                            operator: OP.LT
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('filters by LTE', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const cutoffId = expectedDocs[1].id
                expectedDocs = expectedDocs.filter(doc => doc.id <= cutoffId)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            rightOperand: cutoffId,
                            operator: OP.LTE
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('id >= val < id', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const leftCutoff = expectedDocs[0].id
                const rightCutoff = expectedDocs[1].id
                expectedDocs = expectedDocs.filter(doc => doc.id >= leftCutoff && doc.id < rightCutoff)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            leftOperand: leftCutoff,
                            rightOperand: rightCutoff,
                            leftOperator: OP.GTE,
                            rightOperator: OP.LT
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('id > val < id', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const leftCutoff = expectedDocs[0].id
                const rightCutoff = expectedDocs[2].id
                expectedDocs = expectedDocs.filter(doc => doc.id > leftCutoff && doc.id < rightCutoff)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            leftOperand: leftCutoff,
                            rightOperand: rightCutoff,
                            leftOperator: OP.GT,
                            rightOperator: OP.LT
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('id > val <= id', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const leftCutoff = expectedDocs[0].id
                const rightCutoff = expectedDocs[1].id
                expectedDocs = expectedDocs.filter(doc => doc.id > leftCutoff && doc.id <= rightCutoff)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            leftOperand: leftCutoff,
                            rightOperand: rightCutoff,
                            leftOperator: OP.GT,
                            rightOperator: OP.LTE
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('id >= val <= id', async () => {
                let expectedDocs = Object.values(mockDocuments).sort(idAscSort)
                const leftCutoff = expectedDocs[0].id
                const rightCutoff = expectedDocs[1].id
                expectedDocs = expectedDocs.filter(doc => doc.id >= leftCutoff && doc.id <= rightCutoff)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'id',
                            leftOperand: leftCutoff,
                            rightOperand: rightCutoff,
                            leftOperator: OP.GTE,
                            rightOperator: OP.LTE
                        }],
                    index: 'idIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })
        })

        describe('multi-column boolean + datetime index with filter', () => {
            it('published sorted by date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('published sorted by date desc', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateDescSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }],
                    last: 3,
                    index: 'publishedDateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('published after date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            rightOperand: expectedDocs[0].date,
                            operator: OP.GT
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(expectedDocs.length - 1)
                expect(result.edges[0].node).toEqual(expectedDocs[1])
                expect(result.edges[1].node).toEqual(expectedDocs[2])
            })

            it('published gte date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            rightOperand: expectedDocs[0].date,
                            operator: OP.GTE
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('published before date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            rightOperand: expectedDocs[2].date,
                            operator: OP.LT
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(expectedDocs.length - 1)
                expect(result.edges[0].node).toEqual(expectedDocs[0])
                expect(result.edges[1].node).toEqual(expectedDocs[1])
            })

            it('published lte date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            rightOperand: expectedDocs[2].date,
                            operator: OP.LTE
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                validateResult(result, expectedDocs)
            })

            it('published gt date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            rightOperand: expectedDocs[2].date,
                            operator: OP.GT
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(0)
            })

            it('published date >= val < date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            leftOperand: expectedDocs[0].date,
                            rightOperand: String(new Date(new Date(expectedDocs[0].date).getTime() + 60 * 60 * 1000)),
                            leftOperator: OP.GTE,
                            rightOperator: OP.LT
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(expectedDocs[0])
            })

            it('published date > val < date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            leftOperand: String(new Date(new Date(expectedDocs[0].date).getTime() - 60 * 60 * 1000)),
                            rightOperand: String(new Date(new Date(expectedDocs[0].date).getTime() + 60 * 60 * 1000)),
                            leftOperator: OP.GT,
                            rightOperator: OP.LT
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(expectedDocs[0])
            })

            it('published date > val <= date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            leftOperand: String(new Date(new Date(expectedDocs[0].date).getTime())),
                            rightOperand: String(new Date(new Date(expectedDocs[1].date).getTime())),
                            leftOperator: OP.GT,
                            rightOperator: OP.LTE
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(expectedDocs[1])
            })

            it('published date >= val <= date', async () => {
                const expectedDocs = Object.values(mockDocuments).filter(doc => doc.published).sort(dateAscSort)
                const result = await store.query({
                    filterChain: [
                        {
                            field: 'published',
                            rightOperand: true,
                            operator: OP.EQ
                        }, {
                            field: 'date',
                            leftOperand: String(new Date(new Date(expectedDocs[0].date).getTime() + +60 * 60 * 1000)),
                            rightOperand: String(new Date(new Date(expectedDocs[1].date).getTime())),
                            leftOperator: OP.GTE,
                            rightOperator: OP.LTE
                        }],
                    index: 'publishedDateIdx'
                }, mockHydrator)

                expect(result).toBeDefined()
                expect(result.edges).toHaveLength(1)
                expect(result.edges[0].node).toEqual(expectedDocs[1])
            })
        })
    })
})
