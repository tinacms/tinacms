import { Editor, Transforms, Node } from 'slate'
import type { PlateEditor, TNode, Value } from '@udecode/plate-common'

const MARKS = ['bold', 'italic']

const isMark = (node: TNode) => {
  return MARKS.some((mark) => node[mark])
}

function debounce(func, timeout = 1000) {
  let timer: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

export const markInputRules = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { onChange } = editor

  const debouncedTrimMarks = debounce(() => {
    Editor.withoutNormalizing(editor, () => {
      const nodes = Array.from(Node.texts(editor))

      console.log('Checking for marks to trim...')
      console.log(nodes)

      for (const [node, path] of nodes) {
        if (isMark(node)) {
          const text = node.text
          const trimmedText = text.trim()
          if (trimmedText !== text) {
            // Select the text range to be replaced
            const range = Editor.range(editor, path)

            // Delete the existing text
            Transforms.delete(editor, { at: range })

            // Reapply the marks
            const marks = Object.fromEntries(
              Object.entries(node).filter(([key]) => MARKS.includes(key))
            )

            // Insert the trimmed text with the same marks
            Transforms.insertText(editor, trimmedText, { at: path, ...marks })

            console.log(`Trimmed text at ${path}: "${trimmedText}"`)
          }
        }
      }
    })
  })

  editor.onChange = () => {
    onChange()
    debouncedTrimMarks()
  }

  return editor
}
