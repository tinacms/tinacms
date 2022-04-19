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

import { collectConditionsForField, resolveReferences } from './filter-utils'
import { ReferenceTypeInner, TinaFieldInner } from '../types'
import { FilterCondition } from '@tinacms/datalayer'

describe('resolveReferences', () => {
  it('resolves reference to single item', async () => {
    const filter = {
      author: {
        authors: {
          name: {
            startsWith: 'Foo',
          },
        },
      },
      title: {
        eq: 'My Blog Post',
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'reference',
        name: 'author',
        collections: ['authors'],
      },
      {
        type: 'string',
        name: 'title',
      },
    ]

    const filePath = 'content/authors/foo.md'
    await resolveReferences(
      filter,
      fields,
      (
        filterParam: Record<string, object>,
        fieldDefinition: ReferenceTypeInner
      ) => {
        expect(filterParam).toEqual(filter)
        expect(fieldDefinition).toEqual(fields[0])
        const values = [filePath]
        return Promise.resolve({
          edges: [
            {
              node: {
                name: 'Foo',
              },
            },
          ],
          values,
        })
      }
    )

    expect(filter).toEqual({
      author: {
        eq: filePath,
      },
      title: {
        eq: filter.title.eq,
      },
    })
  })

  it('resolves reference to no items', async () => {
    const filter = {
      author: {
        authors: {
          name: {
            startsWith: 'Foo',
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'reference',
        name: 'author',
        collections: ['authors'],
      },
    ]

    await resolveReferences(
      filter,
      fields,
      (
        filterParam: Record<string, object>,
        fieldDefinition: ReferenceTypeInner
      ) => {
        expect(filterParam).toEqual(filter)
        expect(fieldDefinition).toEqual(fields[0])
        return Promise.resolve({
          edges: [],
          values: [],
        })
      }
    )

    expect(filter).toEqual({
      author: {
        eq: '___null___',
      },
    })
  })

  it('fails when field does not exist', async () => {
    const filter = {
      silly: {
        authors: {
          name: {
            startsWith: 'Foo',
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'reference',
        name: 'author',
        collections: ['authors'],
      },
    ]

    const mockResolver = jest.fn()
    await expect(
      resolveReferences(filter, fields, mockResolver)
    ).rejects.toThrowError('Unable to find field silly')
  })

  it('resolves reference to multiple items', async () => {
    const filter = {
      author: {
        authors: {
          name: {
            startsWith: 'Foo',
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'reference',
        name: 'author',
        collections: ['authors'],
      },
    ]

    const filePaths = ['content/authors/foo1.md', 'content/authors/foo2.md']
    const edges = [
      {
        node: {
          name: 'Foo1',
        },
      },
      {
        node: {
          name: 'Foo2',
        },
      },
    ]
    await resolveReferences(
      filter,
      fields,
      (
        filterParam: Record<string, object>,
        fieldDefinition: ReferenceTypeInner
      ) => {
        expect(filterParam).toEqual(filter)
        expect(fieldDefinition).toEqual(fields[0])
        return Promise.resolve({
          edges,
          values: filePaths,
        })
      }
    )

    expect(filter).toEqual({
      author: {
        in: filePaths,
      },
    })
  })

  it('resolves reference in object with fields', async () => {
    const filter = {
      details: {
        author: {
          authors: {
            name: {
              startsWith: 'Foo',
            },
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'object',
        name: 'details',
        fields: [
          {
            type: 'reference',
            name: 'author',
            collections: ['authors'],
          },
        ],
      },
    ]

    const filePath = 'content/authors/foo.md'
    await resolveReferences(
      filter,
      fields,
      (
        filterParam: Record<string, object>,
        fieldDefinition: ReferenceTypeInner
      ) => {
        expect(filterParam).toEqual(filter['details'])
        expect(fieldDefinition).toEqual((fields[0] as any).fields[0])
        const values = [filePath]
        return Promise.resolve({
          edges: [
            {
              node: {
                name: 'Foo',
              },
            },
          ],
          values,
        })
      }
    )

    expect(filter).toEqual({
      details: {
        author: {
          eq: filePath,
        },
      },
    })
  })

  it('resolves reference in object with template', async () => {
    const filter = {
      details: {
        authorTemplate: {
          author: {
            authors: {
              name: {
                startsWith: 'Foo',
              },
            },
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'object',
        name: 'details',
        templates: [
          {
            label: 'Author',
            fields: [
              {
                type: 'reference',
                name: 'author',
                collections: ['authors'],
              },
            ],
            name: 'authorTemplate',
          },
        ],
      },
    ]

    const filePath = 'content/authors/foo.md'
    await resolveReferences(
      filter,
      fields,
      (
        filterParam: Record<string, object>,
        fieldDefinition: ReferenceTypeInner
      ) => {
        expect(filterParam).toEqual(filter['details']['authorTemplate'])
        expect(fieldDefinition).toEqual(
          (fields[0] as any).templates[0].fields[0]
        )
        const values = [filePath]
        return Promise.resolve({
          edges: [
            {
              node: {
                name: 'Foo',
              },
            },
          ],
          values,
        })
      }
    )

    expect(filter).toEqual({
      details: {
        authorTemplate: {
          author: {
            eq: filePath,
          },
        },
      },
    })
  })

  it('resolves reference in object with template where filter references non-existent template', async () => {
    const filter = {
      details: {
        nonExistentTemplate: {
          author: {
            authors: {
              name: {
                startsWith: 'Foo',
              },
            },
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'object',
        name: 'details',
        templates: [
          {
            label: 'Author',
            fields: [
              {
                type: 'reference',
                name: 'author',
                collections: ['authors'],
              },
            ],
            name: 'authorTemplate',
          },
        ],
      },
    ]

    const resolver = jest.fn()
    await expect(
      resolveReferences(filter, fields, resolver)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Template nonExistentTemplate not found"`
    )
  })

  it('resolves reference in object with template where filter references global template', async () => {
    const filter = {
      details: {
        globalTemplate: {
          author: {
            authors: {
              name: {
                startsWith: 'Foo',
              },
            },
          },
        },
      },
    }
    const fields: TinaFieldInner<false>[] = [
      {
        type: 'object',
        name: 'details',
        templates: ['globalTemplate'],
      },
    ]

    const resolver = jest.fn()
    await expect(
      resolveReferences(filter, fields, resolver)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Global templates not yet supported for queries"`
    )
  })
})

describe('collectConditionsForField', () => {
  it('collects conditions for simple filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const fieldName = 'age'
    const field: TinaFieldInner<false> = {
      type: 'number',
      name: fieldName,
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = filterExpression
    const expectedCondition: FilterCondition = {
      filterPath: fieldName,
      filterExpression: {
        _type: field.type,
        ...filterExpression,
      },
    }
    collectConditionsForField(fieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('collects conditions for nested list object filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const parentFieldName = 'items'
    const childFieldName = 'age'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: parentFieldName,
      list: true,
      fields: [
        {
          type: 'number',
          name: childFieldName,
        },
      ],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      age: filterExpression,
    }
    const expectedCondition: FilterCondition = {
      filterPath: `${parentFieldName}[*].${childFieldName}`,
      filterExpression: {
        _type: (field.fields[0] as TinaFieldInner<false>).type,
        ...filterExpression,
      },
    }
    collectConditionsForField(parentFieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('collects conditions for nested object filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const parentFieldName = 'items'
    const childFieldName = 'age'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: parentFieldName,
      list: false,
      fields: [
        {
          type: 'number',
          name: childFieldName,
        },
      ],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      age: filterExpression,
    }
    const expectedCondition: FilterCondition = {
      filterPath: `${parentFieldName}.${childFieldName}`,
      filterExpression: {
        _type: (field.fields[0] as TinaFieldInner<false>).type,
        ...filterExpression,
      },
    }
    collectConditionsForField(parentFieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('collects conditions for deeply nested object filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const parentFieldName = 'items'
    const childFieldName = 'person'
    const grandchildFieldName = 'age'
    const type = 'number'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: parentFieldName,
      list: false,
      fields: [
        {
          type: 'object',
          name: childFieldName,
          fields: [
            {
              type,
              name: grandchildFieldName,
            },
          ],
        },
      ],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      person: {
        age: filterExpression,
      },
    }
    const expectedCondition: FilterCondition = {
      filterPath: `${parentFieldName}.${childFieldName}.${grandchildFieldName}`,
      filterExpression: {
        _type: type,
        ...filterExpression,
      },
    }
    collectConditionsForField(parentFieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('fails to collect conditions for nested list object filter with non-existent field', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const parentFieldName = 'items'
    const childFieldName = 'age'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: parentFieldName,
      list: true,
      fields: [
        {
          type: 'number',
          name: childFieldName,
        },
      ],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      age: filterExpression,
      zip: {
        eq: 1,
      },
    }
    expect(() => {
      collectConditionsForField(
        parentFieldName,
        field,
        filterNode,
        '',
        collector
      )
    }).toThrowErrorMatchingInlineSnapshot(`"Unable to find type for field zip"`)
  })

  it('collects conditions for nested list template filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const parentFieldName = 'items'
    const childFieldName = 'age'
    const templateName = 'features'
    const childType = 'number'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: parentFieldName,
      list: true,
      templates: [
        {
          name: templateName,
          label: templateName,
          fields: [
            {
              type: childType,
              name: childFieldName,
            },
          ],
        },
      ],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      [templateName]: {
        age: filterExpression,
      },
    }
    const expectedCondition: FilterCondition = {
      filterPath: `${parentFieldName}[?(@._template=="${templateName}")].${childFieldName}`,
      filterExpression: {
        _type: childType,
        ...filterExpression,
      },
    }
    collectConditionsForField(parentFieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('collects conditions for deeply nested list template filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const rootFieldName = 'root'
    const parentFieldName = 'items'
    const childFieldName = 'age'
    const templateName = 'features'
    const childType = 'number'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: rootFieldName,
      fields: [
        {
          type: 'object',
          name: parentFieldName,
          list: true,
          templates: [
            {
              name: templateName,
              label: templateName,
              fields: [
                {
                  type: childType,
                  name: childFieldName,
                },
              ],
            },
          ],
        },
      ],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      [parentFieldName]: {
        [templateName]: {
          age: filterExpression,
        },
      },
    }
    const expectedCondition: FilterCondition = {
      filterPath: `${rootFieldName}.${parentFieldName}[?(@._template=="${templateName}")].${childFieldName}`,
      filterExpression: {
        _type: childType,
        ...filterExpression,
      },
    }
    collectConditionsForField(rootFieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('fails with global template', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const parentFieldName = 'items'
    const templateName = 'my-global-template'
    const field: TinaFieldInner<false> = {
      type: 'object',
      name: parentFieldName,
      list: true,
      templates: [templateName],
    }
    const filterExpression: Record<string, any> = {
      gte: 18,
    }
    const filterNode = {
      [templateName]: {
        age: filterExpression,
      },
    }
    expect(() => {
      collectConditionsForField(
        parentFieldName,
        field,
        filterNode,
        '',
        collector
      )
    }).toThrowErrorMatchingInlineSnapshot(
      `"Global templates not yet supported for queries"`
    )
  })
})
