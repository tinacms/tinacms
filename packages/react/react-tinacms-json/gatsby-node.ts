exports.onCreateNode = ({ node, actions, getNode }: any) => {
  const { createNodeField } = actions

  if (node.internal.type === `DataJson`) {
    // const value = createFilePath({ node, getNode })
    let pathRoot = process.cwd()
    let parent = getNode(node.parent)
    createNodeField({
      name: `fileRelativePath`,
      node,
      value: parent.absolutePath.replace(pathRoot, ''),
    })
  }
}
