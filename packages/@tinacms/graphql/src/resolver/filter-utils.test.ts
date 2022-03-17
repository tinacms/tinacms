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

import {resolveReferences} from './filter-utils'
import {TinaFieldInner, ReferenceTypeInner} from '../types'

describe('resolveReferences', () => {
    it('resolves reference to single item', async () => {
        const filter = {
            author: {
                authors: {
                    name: {
                        startsWith: 'Foo'
                    }
                }
            }
        }
        const fields: TinaFieldInner<false>[] = [{
            type: 'reference',
            name: 'author',
            collections: ['authors']
        }]

        const filePath = 'content/authors/foo.md'
        await resolveReferences(filter, fields, (filterParam: Record<string, object>, fieldDefinition: ReferenceTypeInner) => {
            expect(filterParam).toEqual(filter)
            expect(fieldDefinition).toEqual(fields[0])
            const values = [filePath]
            return Promise.resolve({
                edges: [{node: {
                        name: 'Foo'
                    }}],
                values
            })
        })

        expect(filter).toEqual({
            author: {
                eq: filePath
            }
        })
    })

    it('resolves reference to no items', async () => {
        const filter = {
            author: {
                authors: {
                    name: {
                        startsWith: 'Foo'
                    }
                }
            }
        }
        const fields: TinaFieldInner<false>[] = [{
            type: 'reference',
            name: 'author',
            collections: ['authors']
        }]

        await resolveReferences(filter, fields, (filterParam: Record<string, object>, fieldDefinition: ReferenceTypeInner) => {
            expect(filterParam).toEqual(filter)
            expect(fieldDefinition).toEqual(fields[0])
            return Promise.resolve({
                edges: [],
                values: []
            })
        })

        expect(filter).toEqual({
            author: {
                eq: '___null___'
            }
        })
    })

    it('fails when field does not exist', async () => {
        const filter = {
            silly: {
                authors: {
                    name: {
                        startsWith: 'Foo'
                    }
                }
            }
        }
        const fields: TinaFieldInner<false>[] = [{
            type: 'reference',
            name: 'author',
            collections: ['authors']
        }]

        const mockResolver = jest.fn()
        await expect(resolveReferences(filter, fields, mockResolver)).rejects.toThrowError('Unable to find field silly')
    })

    it('resolves reference to multiple items', async () => {
        const filter = {
            author: {
                authors: {
                    name: {
                        startsWith: 'Foo'
                    }
                }
            }
        }
        const fields: TinaFieldInner<false>[] = [{
            type: 'reference',
            name: 'author',
            collections: ['authors']
        }]

        const filePaths = ['content/authors/foo1.md', 'content/authors/foo2.md']
        const edges = [{
            node: {
                name: 'Foo1'
            },
        }, {
            node: {
                name: 'Foo2'
            }
        }]
        await resolveReferences(filter, fields, (filterParam: Record<string, object>, fieldDefinition: ReferenceTypeInner) => {
            expect(filterParam).toEqual(filter)
            expect(fieldDefinition).toEqual(fields[0])
            return Promise.resolve({
                edges,
                values: filePaths
            })
        })

        expect(filter).toEqual({
            author: {
                in: filePaths
            }
        })
    })

    it('resolves reference in object with fields', async () => {
        const filter = {
            details: {
                author: {
                    authors: {
                        name: {
                            startsWith: 'Foo'
                        }
                    }
                }
            }
        }
        const fields: TinaFieldInner<false>[] = [{
            type: 'object',
            name: 'details',
            fields: [{
                type: 'reference',
                name: 'author',
                collections: ['authors']
            }]
        }]

        const filePath = 'content/authors/foo.md'
        await resolveReferences(filter, fields, (filterParam: Record<string, object>, fieldDefinition: ReferenceTypeInner) => {
            expect(filterParam).toEqual(filter['details'])
            expect(fieldDefinition).toEqual((fields[0] as any).fields[0])
            const values = [filePath]
            return Promise.resolve({
                edges: [{node: {
                        name: 'Foo'
                    }}],
                values
            })
        })

        expect(filter).toEqual({
            details: {
                author: {
                    eq: filePath
                }
            }
        })
    })

    it('resolves reference in object with template', async () => {
        const filter = {
            details: {
                authorTemplate: {
                    author: {
                        authors: {
                            name: {
                                startsWith: 'Foo'
                            }
                        }
                    }
                }
            }
        }
        const fields: TinaFieldInner<false>[] = [{
            type: 'object',
            name: 'details',
            templates: [{
                label: 'Author',
                 fields: [{
                     type: 'reference',
                     name: 'author',
                     collections: ['authors']
                 }],
                 name: 'authorTemplate'
            }]
        }]

        const filePath = 'content/authors/foo.md'
        await resolveReferences(filter, fields, (filterParam: Record<string, object>, fieldDefinition: ReferenceTypeInner) => {
            expect(filterParam).toEqual(filter['details']['authorTemplate'])
            expect(fieldDefinition).toEqual((fields[0] as any).templates[0].fields[0])
            const values = [filePath]
            return Promise.resolve({
                edges: [{node: {
                        name: 'Foo'
                    }}],
                values
            })
        })

        expect(filter).toEqual({
            details: {
                authorTemplate: {
                    author: {
                        eq: filePath
                    }
                }
            }
        })
    })
})