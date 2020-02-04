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
const { GraphQLString } = require('gatsby/graphql')
const slash = require('slash')

exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  const pathRoot = slash(process.cwd())

  const hasMdx = !!type.nodes.find(
    node => node.internal.owner === 'gatsby-plugin-mdx'
  )

  if (hasMdx) {
    return {
      rawFrontmatter: {
        type: GraphQLString,
        resolve: source => {
          return JSON.stringify(source.frontmatter)
        }
      },
      rawMarkdownBody: {
        type: GraphQLString,
        resolve: source => {
          return JSON.stringify(source.rawBody)
        }
      },
      fileRelativePath: {
        type: GraphQLString,
        resolve: source => {
          return source.fileAbsolutePath.replace(pathRoot, '')
        }
      }
    }
  }

  // by default return empty object
  return {}
}
