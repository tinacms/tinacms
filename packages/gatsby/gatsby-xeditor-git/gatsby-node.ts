import { router as gitRouter, GitRouterConfig } from '@tinacms/api-git'
// @ts-ignore
import { GraphQLString } from 'gatsby/graphql'

exports.setFieldsOnGraphQLNodeType = ({ type }: any) => {
  const pathRoot = process.cwd()
  if (type.name === `MarkdownRemark`) {
    return {
      rawFrontmatter: {
        type: GraphQLString,
        args: {
          myArgument: {
            type: GraphQLString,
          },
        },
        resolve: (source: any) => {
          return JSON.stringify(source.frontmatter)
        },
      },
      fileRelativePath: {
        type: GraphQLString,
        args: {
          myArgument: {
            type: GraphQLString,
          },
        },
        resolve: (source: any) => {
          return source.fileAbsolutePath.replace(pathRoot, '')
        },
      },
    }
  }

  // by default return empty object
  return {}
}

exports.onCreateDevServer = ({ app }: any, options: GitRouterConfig) => {
  app.use('/___tina', gitRouter(options))
}
