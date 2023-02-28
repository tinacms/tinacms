/**

*/
export function addNamespaceToSchema<T extends object | string>(
  maybeNode: T,
  namespace: string[] = []
): T {
  if (typeof maybeNode === 'string') {
    return maybeNode
  }
  if (typeof maybeNode === 'boolean') {
    return maybeNode
  }
  if (typeof maybeNode === 'function') {
    return maybeNode
  }

  // @ts-ignore
  const newNode: {
    [key in keyof T]: (T & { namespace?: string[] }) | string
    // @ts-ignore
  } = { ...maybeNode }

  // Traverse node's properties first
  const keys = Object.keys(maybeNode)
  Object.values(maybeNode).map((m, index) => {
    const key = keys[index]
    if (Array.isArray(m)) {
      // @ts-ignore
      newNode[key] = m.map((element) => {
        if (!element) {
          return
        }
        if (!element.hasOwnProperty('name')) {
          return element
        }
        const value = element.name || element.value // options field accepts an object with `value`  instead of `name`
        return addNamespaceToSchema(element, [...namespace, value])
      })
    } else {
      if (!m) {
        return
      }
      if (!m.hasOwnProperty('name')) {
        // @ts-ignore
        newNode[key] = m
      } else {
        // @ts-ignore
        newNode[key] = addNamespaceToSchema(m, [...namespace, m.name])
      }
    }
  })
  // @ts-ignore
  return { ...newNode, namespace: namespace }
}
