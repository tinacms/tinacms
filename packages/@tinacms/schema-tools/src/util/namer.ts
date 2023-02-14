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

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const generateNamespacedFieldName = (names: string[], suffix: string = '') => {
  return (suffix ? [...names, suffix] : names)
    .map(capitalize)
    .join('')
    .replaceAll('-', '_')
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
