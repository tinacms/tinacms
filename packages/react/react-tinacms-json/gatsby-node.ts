// @ts-ignore
import { GraphQLString } from 'gatsby/graphql'

exports.setFieldsOnGraphQLNodeType = ({ type, getNode }: any) => {
  let pathRoot = process.cwd()

  if (!/.*Json$/.test(type.name)) {
    return {}
  }

  return {
    rawJsonData: {
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
        let p = getNode(parent)

        return p.absolutePath.replace(pathRoot, '')
      },
    },
  }
}
