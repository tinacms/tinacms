// @ts-ignore
import { GraphQLString } from 'gatsby/graphql'

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
      resolve: ({ children, id, internal, parent, ...data }: any) => {
        const p = getNode(parent)

        return p.absolutePath.replace(pathRoot, '')
      },
    },
  }
}
