import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import { LexicalRootSchema } from './validator'

export const exportToMarkdownAst = (
  json: SerializedEditorState<SerializedLexicalNode>
) => {
  console.log(json.root)
  const result = LexicalRootSchema.safeParse(json.root)
  if (result.success) {
    console.log(result)
    // const root: Root = {type: 'root', children: []}
    // result.data.children.forEach(child => {
    //   child.
    //   root.children.push()
    // })
    // const string = stringifyMDX(result.data)
    // console.log(string)
  } else {
    console.log(result.error)
  }
}
