/**

*/

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const generateNamespacedFieldName = (names: string[], suffix: string = '') => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join('')
}

export const NAMER = {
  dataFilterTypeNameOn: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '_FilterOn')
  },
  dataFilterTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Filter')
  },
  dataMutationTypeNameOn: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '_MutationOn')
  },
  dataMutationTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Mutation')
  },
  updateName: (namespace: string[]) => {
    return 'update' + generateNamespacedFieldName(namespace, 'Document')
  },
  createName: (namespace: string[]) => {
    return 'create' + generateNamespacedFieldName(namespace, 'Document')
  },
  queryName: (namespace: string[]) => {
    return 'get' + generateNamespacedFieldName(namespace, 'Document')
  },
  generateQueryListName: (namespace: string[]) => {
    return 'get' + generateNamespacedFieldName(namespace, 'List')
  },
  fragmentName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '') + 'Parts'
  },
  collectionTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Collection')
  },
  documentTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Document')
  },
  dataTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, '')
  },
  referenceConnectionType: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'Connection')
  },
  referenceConnectionEdgesTypeName: (namespace: string[]) => {
    return generateNamespacedFieldName(namespace, 'ConnectionEdges')
  },
}
