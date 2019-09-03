import { router as gitRouter } from '@tinacms/cms-backend-git'

exports.onCreateNode = ({ node, actions }: any) => {
  let pathRoot = process.cwd()

  if (node.internal && node.internal.type === 'MarkdownRemark') {
    actions.createNodeField({
      node,
      name: 'fileRelativePath',
      value: node.fileAbsolutePath.replace(pathRoot, ''),
    })
  }
}

exports.onCreateDevServer = ({ app }: { app: any }) => {
  app.use('/x-server', gitRouter())
}
