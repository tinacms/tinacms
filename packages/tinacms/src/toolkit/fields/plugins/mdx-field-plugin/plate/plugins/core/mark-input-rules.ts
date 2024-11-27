import { Editor, Transforms, Node, Path } from 'slate'
import type {
  PlateEditor,
  TNode,
  TNodeEntry,
  Value,
} from '@udecode/plate-common'

const MARKS = ['bold', 'italic']
let trimQueue: Array<{ node: TNode; path: Path }> = []
let processingTimeout: ReturnType<typeof setTimeout> | null = null

const isMark = (node: TNode) => {
  return MARKS.some((mark) => node[mark])
}

const processTrimQueue = (editor: PlateEditor) => {
  Editor.withoutNormalizing(editor, () => {
    while (trimQueue.length > 0) {
      const { node, path } = trimQueue.shift()!

      if (!Editor.hasPath(editor, path)) {
        console.warn('Skipping invalid path:', path)
        continue
      }

      const currentNode = Node.get(editor, path)
      if (!currentNode || currentNode.type !== 'text') {
        console.warn('Skipping invalid or non-text node:', currentNode)
        continue
      }

      const text = currentNode.text as string
      const trimmedText = text.trim()

      if (trimmedText !== text) {
        // Ensure the parent node exists and has children
        const parentPath = Path.parent(path)
        if (!Editor.hasPath(editor, parentPath)) {
          console.error('Parent path is invalid:', parentPath)
          continue
        }

        const parentNode = Node.get(editor, parentPath)
        if (!parentNode.children || parentNode.children.length === 0) {
          // Add a default text node if parent is empty
          Transforms.insertNodes(
            editor,
            { text: '', type: 'text' },
            { at: parentPath.concat(0) }
          )
        }

        // Perform trimming
        Transforms.removeNodes(editor, { at: path })
        Editor.insertNode(editor, {
          ...currentNode,
          text: trimmedText,
        })

        console.log(`Trimmed text at ${path}: "${trimmedText}"`)
      }
    }
  })
}

export const markInputRules = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { normalizeNode } = editor

  editor.normalizeNode = ([node, path]: TNodeEntry) => {
    if (node.type === 'p' && Array.isArray(node.children)) {
      for (const index in node.children) {
        const child = node.children[index]
        if (child.type === 'text' && isMark(child)) {
          trimQueue.push({ node: child, path: path.concat(Number(index)) })
        }
      }
    } else if (node.type === 'text' && isMark(node)) {
      trimQueue.push({ node, path })
    }

    if (processingTimeout) clearTimeout(processingTimeout)

    processingTimeout = setTimeout(() => {
      processTrimQueue(editor as PlateEditor)
    }, 300) // Debounce delay

    normalizeNode([node, path])
  }

  return editor
}
