import { collectConditionsForField, resolveReferences } from './filter-utils'
import { ReferenceType, TinaField } from '@tinacms/schema-tools'
import { FilterCondition } from '../database/datalayer'
import { describe, it, expect, vi } from 'vitest'

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
    const fields: TinaField[] = [
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
      (filterParam: Record<string, object>, fieldDefinition: ReferenceType) => {
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
    const fields: TinaField[] = [
      {
        type: 'reference',
        name: 'author',
        collections: ['authors'],
      },
    ]

    await resolveReferences(
      filter,
      fields,
      (filterParam: Record<string, object>, fieldDefinition: ReferenceType) => {
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
    const fields: TinaField[] = [
      {
        type: 'reference',
        name: 'author',
        collections: ['authors'],
      },
    ]

    const mockResolver = vi.fn()
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
    const fields: TinaField[] = [
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
      (filterParam: Record<string, object>, fieldDefinition: ReferenceType) => {
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
    const fields: TinaField[] = [
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
      (filterParam: Record<string, object>, fieldDefinition: ReferenceType) => {
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
    const fields: TinaField[] = [
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
      (filterParam: Record<string, object>, fieldDefinition: ReferenceType) => {
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
    const fields: TinaField[] = [
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

    const resolver = vi.fn()
    await expect(
      resolveReferences(filter, fields, resolver)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Template nonExistentTemplate not found"`
    )
  })
})

describe('collectConditionsForField', () => {
  it('collects conditions for simple filter', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const fieldName = 'age'
    const field: TinaField = {
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
        _list: false,
        ...filterExpression,
      },
    }
    collectConditionsForField(fieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })

  it('collects conditions for simple filter on list field', () => {
    const conditions: FilterCondition[] = []
    const collector = (condition: FilterCondition) => conditions.push(condition)
    const fieldName = 'age'
    const field: TinaField = {
      type: 'number',
      list: true,
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
        _list: true,
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
    const field: TinaField = {
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
        _type: (field.fields[0] as TinaField).type,
        _list: false,
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
    const field: TinaField = {
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
        _type: (field.fields[0] as TinaField).type,
        _list: false,
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
    const field: TinaField = {
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
        _list: false,
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
    const field: TinaField = {
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
    const field: TinaField = {
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
        _list: false,
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
    const field: TinaField = {
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
        _list: false,
        ...filterExpression,
      },
    }
    collectConditionsForField(rootFieldName, field, filterNode, '', collector)
    expect(conditions).toHaveLength(1)
    expect(conditions[0]).toEqual(expectedCondition)
  })
})
