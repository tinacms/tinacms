import { addNamespaceToSchema } from './addNamespaceToSchema' // Adjust the import path as necessary

// Define a mock Node type if it's not provided
type Node = {
  name?: string
  value?: string
  namespace?: string[]
  children?: Node[]
  [key: string]: any
}

describe('addNamespaceToSchema', () => {
  test('should return string unchanged', () => {
    const result = addNamespaceToSchema('testString')
    expect(result).toBe('testString')
  })

  test('should return null unchanged', () => {
    // @ts-ignore
    const result = addNamespaceToSchema(null)
    expect(result).toBeNull()
  })

  test('should return undefined unchanged', () => {
    // @ts-ignore
    const result = addNamespaceToSchema(undefined)
    expect(result).toBeUndefined()
  })

  test('should add an empty namespace to a single root node with name', () => {
    const node = { name: 'node1' }
    const result = addNamespaceToSchema(node)
    expect(result).toEqual({ ...node, namespace: [] })
  })

  test('should add an empty namespace to a single root node with value', () => {
    const node = { value: 'node1' }
    const result = addNamespaceToSchema(node)
    expect(result).toEqual({ ...node, namespace: [] })
  })

  test('should add namespaces recursively to nested nodes', () => {
    const node = {
      name: 'root',
      children: [
        { name: 'child1' },
        { name: 'child2', children: [{ name: 'grandchild1' }] },
      ],
    }
    const result = addNamespaceToSchema(node)
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        { name: 'child1', namespace: ['child1'] },
        {
          name: 'child2',
          namespace: ['child2'],
          children: [
            { name: 'grandchild1', namespace: ['child2', 'grandchild1'] },
          ],
        },
      ],
    })
  })

  test('should handle nodes without name or value properties', () => {
    const node = {
      otherProp: 'data',
      children: [{ otherProp: 'childData' }],
    }
    const result = addNamespaceToSchema(node)
    console.log(result)
    expect(result).toEqual({
      otherProp: 'data',
      namespace: [],
      children: [{ otherProp: 'childData' }],
    })
  })

  test('should handle mixed content in arrays', () => {
    const node = {
      name: 'root',
      mixedArray: [
        { name: 'child1' },
        'stringElement',
        { otherProp: 'childData' },
      ],
    }
    const result = addNamespaceToSchema(node)
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      mixedArray: [
        { name: 'child1', namespace: ['child1'] },
        'stringElement',
        { otherProp: 'childData' },
      ],
    })
  })

  test('should maintain original properties not related to name or namespace', () => {
    const node = {
      name: 'node1',
      otherProp: 'value',
    }
    const result = addNamespaceToSchema(node)
    expect(result).toEqual({
      name: 'node1',
      namespace: [],
      otherProp: 'value',
    })
  })

  test('should correctly generate separate namespaces for nested objects', () => {
    const node = {
      name: 'root',
      children: [
        { name: 'child1' },
        { name: 'child2', children: [{ name: 'grandchild1' }] },
      ],
    }

    const result = addNamespaceToSchema(node)

    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        { name: 'child1', namespace: ['child1'] },
        {
          name: 'child2',
          namespace: ['child2'],
          children: [
            { name: 'grandchild1', namespace: ['child2', 'grandchild1'] },
          ],
        },
      ],
    })

    // Check if namespaces are not affecting each other
    expect((result.children[0] as Node).namespace).toEqual(['child1'])
    expect((result.children[1] as Node).namespace).toEqual(['child2'])
    expect((result.children?.[1]?.children?.[0] as Node).namespace).toEqual([
      'child2',
      'grandchild1',
    ])
  })

  test('should generate separate namespaces for sibling nodes', () => {
    const node = {
      name: 'root',
      children: [
        { name: 'child1' },
        { name: 'child2', children: [{ name: 'child1' }] }, // Repeated 'child1' name
      ],
    }

    const result = addNamespaceToSchema(node)

    // Verify that namespaces are correctly separated
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        { name: 'child1', namespace: ['child1'] },
        {
          name: 'child2',
          namespace: ['child2'],
          children: [
            { name: 'child1', namespace: ['child2', 'child1'] }, // Should not be affected by the first 'child1'
          ],
        },
      ],
    })

    // Ensure namespaces do not share references
    expect((result.children[0] as Node).namespace).toEqual(['child1'])
    expect((result.children[1] as Node).namespace).toEqual(['child2'])
    expect((result.children?.[1]?.children?.[0] as Node).namespace).toEqual([
      'child2',
      'child1',
    ])
  })

  test('should correctly construct namespaces for nodes with the same names', () => {
    const node = {
      name: 'root',
      children: [
        { name: 'child', children: [{ name: 'grandchild' }] },
        { name: 'child', children: [{ name: 'grandchild' }] }, // Same name structure
      ],
    }

    const result = addNamespaceToSchema(node)

    // Verify that namespaces are correctly constructed
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        {
          name: 'child',
          namespace: ['child'],
          children: [
            { name: 'grandchild', namespace: ['child', 'grandchild'] },
          ],
        },
        {
          name: 'child',
          namespace: ['child'],
          children: [
            { name: 'grandchild', namespace: ['child', 'grandchild'] },
          ],
        },
      ],
    })

    // Ensure namespaces are independently constructed and not shared by reference
    expect((result.children[0] as Node).namespace).not.toBe(
      (result.children[1] as Node).namespace
    )
    expect((result.children[0].children[0] as Node).namespace).not.toBe(
      (result.children[1].children[0] as Node).namespace
    )
  })

  test('should correctly handle repeated names at different levels', () => {
    const node = {
      name: 'root',
      children: [
        {
          name: 'child',
          nested: { name: 'child' }, // Repeated name at a deeper level
        },
      ],
    }

    const result = addNamespaceToSchema(node)

    // Verify that namespaces are correctly constructed
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        {
          name: 'child',
          namespace: ['child'],
          nested: {
            name: 'child',
            namespace: ['child', 'child'], // Should reflect the nesting with repeated name
          },
        },
      ],
    })

    // Ensure nested namespaces are correctly formed
    expect((result.children[0] as Node).namespace).toEqual(['child'])
    expect((result.children[0].nested as Node).namespace).toEqual([
      'child',
      'child',
    ])
  })

  test('should preserve existing namespaces for repeated names at different levels', () => {
    const node = {
      name: 'root',
      namespace: [], // Existing namespace
      children: [
        {
          name: 'child',
          namespace: ['child'], // Existing namespace
          nested: {
            name: 'child',
            namespace: ['child', 'child'], // Existing namespace for repeated name
          },
        },
      ],
    }

    const result = addNamespaceToSchema(node)

    // Verify that the function does not modify the existing namespaces
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        {
          name: 'child',
          namespace: ['child'],
          nested: {
            name: 'child',
            namespace: ['child', 'child'],
          },
        },
      ],
    })

    // Ensure the namespaces are correctly preserved
    expect((result.children[0] as Node).namespace).toEqual(['child'])
    expect((result.children[0].nested as Node).namespace).toEqual([
      'child',
      'child',
    ])
  })

  test('should preserve existing namespaces and not modify them', () => {
    const node = {
      name: 'root',
      namespace: [], // Assume namespace is already set
      children: [
        {
          name: 'child',
          namespace: ['child'],
          nested: {
            name: 'grandchild',
            namespace: ['child', 'grandchild'], // Correct namespace already set
          },
        },
      ],
    }

    const result = addNamespaceToSchema(node)

    // Verify that the function does not modify the existing namespaces
    expect(result).toEqual({
      name: 'root',
      namespace: [],
      children: [
        {
          name: 'child',
          namespace: ['child'],
          nested: {
            name: 'grandchild',
            namespace: ['child', 'grandchild'],
          },
        },
      ],
    })

    // Ensure the namespaces are not modified
    expect(result).toStrictEqual(node) // Check if the function returns the same object
  })

  test('deeply nested schema issue #5364', () => {
    // This schema is a reduced version of the one from issue #5364
    const schema = JSON.parse(
      '{"collections":[{"label":"Page Content","name":"page","path":"content/page","format":"mdx","fields":[{"name":"blocks","type":"object","label":"Sections","ui":{"visualSelector":true},"list":true,"templates":[{"name":"imageBlock","label":"Image","fields":[{"name":"advancedImageOptions","type":"object","label":"Image Options","fields":[{"name":"effects","type":"object","label":"Effects","fields":[{"name":"optimizations","type":"object","label":"Optimizations","fields":[{"name":"improve","type":"number","label":"Auto Improve","ui":{},"namespace":["page","blocks","generativeImageBlock","advancedImageOptions","effects","optimizations","improve"]}],"namespace":["page","blocks","imageBlock","advancedImageOptions","effects","optimizations"]}],"namespace":["page","blocks","imageBlock","advancedImageOptions","effects"]}],"namespace":["page","blocks","imageBlock","advancedImageOptions"],"searchable":true,"uid":false}],"namespace":["page","blocks","imageBlock"]},{"name":"generativeImageBlock","label":"Image with Generative Options","fields":[{"name":"advancedImageOptions","type":"object","label":"Image Options","fields":[{"name":"effects","type":"object","label":"Effects","fields":[{"name":"optimizations","type":"object","label":"Optimizations","fields":[{"name":"improve","type":"number","label":"Auto Improve","ui":{},"namespace":["page","blocks","generativeImageBlock","advancedImageOptions","effects","optimizations","improve"]}],"namespace":["page","blocks","generativeImageBlock","advancedImageOptions","effects","optimizations"]}],"namespace":["page","blocks","generativeImageBlock","advancedImageOptions","effects"]},{"name":"generativeAi","type":"object","label":"Generative AI","fields":[{"name":"genRemove","type":"object","label":"Generative AI Remove","fields":[{"name":"shadow","type":"boolean","label":"Remove Shadows","description":"Remove shadows from the image.","namespace":["page","blocks","generativeImageBlock","advancedImageOptions","generativeAi","genRemove","shadow"]}],"namespace":["page","blocks","generativeImageBlock","advancedImageOptions","generativeAi","genRemove"]}],"namespace":["page","blocks","generativeImageBlock","advancedImageOptions","generativeAi"]}],"namespace":["page","blocks","generativeImageBlock","advancedImageOptions"],"searchable":true,"uid":false}],"ui":{},"namespace":["page","blocks","generativeImageBlock"]}],"namespace":["page","blocks"],"searchable":true,"uid":false}],"ui":{},"namespace":["page"]}],"config":{"media":{"tina":{"publicFolder":"public","mediaRoot":"uploads"}}},"namespace":[]}'
    )
    expect(addNamespaceToSchema(schema)).toEqual(schema)
  })
})
