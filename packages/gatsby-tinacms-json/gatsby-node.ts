/**

Copyright 2019 Forestry.io Inc

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

import { GraphQLString } from 'graphql'

exports.setFieldsOnGraphQLNodeType = ({ type, getNode }: any) => {
  const pathRoot = process.cwd()

  if (!/.*Json$/.test(type.name)) {
    return {}
  }

  return {
    rawJson: {
      type: GraphQLString,
      args: {},
      resolve: ({ children, id, internal, parent, ...data }: any) => {
        return JSON.stringify(data)
      },
    },
    fileRelativePath: {
      type: GraphQLString,
      args: {},
      resolve: ({ children, id, internal, parent, ..._data }: any) => {
        const p = getNode(parent)

        return p.absolutePath.replace(pathRoot, '')
      },
    },
  }
}
