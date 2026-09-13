import { NodeApi } from '@udecode/plate';
import { getListItemEntry } from '@udecode/plate-list';
import { type PlateEditor } from '@udecode/plate/react';
import { ELEMENT_IMG } from '../create-img-plugin';
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins';
import { HANDLES_MDX } from './formatting';

export const unsupportedItemsInTable = new Set([
  'Code Block',
  'Unordered List',
  'Ordered List',
  'Horizontal Rule',
  'Quote',
  'Mermaid',
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Heading 4',
  'Heading 5',
  'Heading 6',
]);

const isNodeActive = (editor, type) => {
  const pluginType = editor.getType(type);
  return (
    !!editor?.selection && editor.api.some({ match: { type: pluginType } })
  );
};

const isListActive = (editor, type) => {
  const res = !!editor?.selection && getListItemEntry(editor);
  return !!res && res.list[0].type === type;
};

let seededNodeIds = 0;
const withRootNodeIds = (nodes: any[]) =>
  nodes.map((node) =>
    node.id ? node : { ...node, id: `seed-${++seededNodeIds}` }
  );

const normalize = (node: any) => {
  if (
    [ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG].includes(node.type)
  ) {
    return {
      ...node,
      children: [{ type: 'text', text: '' }],
    };
  }
  if (node.children) {
    if (node.children.length) {
      return {
        ...node,
        children: node.children.map(normalize),
      };
    }
    return {
      ...node,
      children: [{ text: '' }],
    };
  }
  return node;
};

export const insertInlineElement = (editor: PlateEditor, inlineElement) => {
  editor.tf.insertNodes([inlineElement]);
};

export const insertBlockElement = (editor: PlateEditor, blockElement) => {
  editor.tf.withoutNormalizing(() => {
    const block = editor.api.block();
    if (!block) return;
    if (isCurrentBlockEmpty(editor)) {
      editor.tf.setNodes(blockElement);
    } else {
      editor.tf.insertNodes([blockElement]);
    }
  });
};

const isCurrentBlockEmpty = (editor) => {
  if (!editor.selection) {
    return false;
  }
  const [node] = editor.api.node(editor.selection);
  const cursor = editor.selection.focus;
  const blockAbove = editor.api.block();
  const isEmpty =
    !NodeApi.string(node) &&
    !node.children?.some((child) => editor.api.isInline(child)) &&
    editor.api.isStart(cursor, blockAbove[1]);

  return isEmpty;
};

const currentNodeSupportsMDX = (editor: PlateEditor) =>
  editor.api.node({
    match: { type: HANDLES_MDX },
  });

export function normalizeLinksInCodeBlocks(node) {
  if (node.type === 'code_line' && node.children) {
    return {
      ...node,
      children: node.children.flatMap((child) => {
        if (child.type === 'a') {
          return child.children || [];
        }
        return [normalizeLinksInCodeBlocks(child)];
      }),
    };
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(normalizeLinksInCodeBlocks),
    };
  }
  return node;
}

export const helpers = {
  isNodeActive,
  isListActive,
  currentNodeSupportsMDX,
  normalize,
  normalizeLinksInCodeBlocks,
  withRootNodeIds,
};
