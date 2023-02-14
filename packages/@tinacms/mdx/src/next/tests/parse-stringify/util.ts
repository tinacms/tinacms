import { visit } from 'unist-util-visit'
// @ts-ignore
export function removePosition(tree) {
  visit(tree, remove)

  return tree

  // @ts-ignore
  function remove(node) {
    // node?.attributes?.forEach((att) => {
    //   if (att?.value?.data) {
    //     delete att?.value?.data
    //   }
    //   delete att.data
    // })
    delete node.position
  }
}
