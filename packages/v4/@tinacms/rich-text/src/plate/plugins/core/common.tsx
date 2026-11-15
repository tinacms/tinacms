import { NodeApi } from '@udecode/plate';
import { getListItemEntry } from '@udecode/plate-list';
import { type PlateEditor } from '@udecode/plate/react';
import type { RichTextNode } from '../../../value';
import { ELEMENT_IMG } from '../create-img-plugin';
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins';
import { HANDLES_MDX } from './formatting';

export const unsupportedItemsInTable: ReadonlySet<string> = new Set([
  'ul',
  'ol',
  'quote',
  'codeBlock',
  'mermaid',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
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
const TABLE_PARTS = new Set(['table', 'tr', 'td', 'th']);

const withNodeIds = (node: any): any => {
  const withId = node.id ? node : { ...node, id: `seed-${++seededNodeIds}` };
  if (!TABLE_PARTS.has(node.type) || !Array.isArray(node.children)) {
    return withId;
  }
  return { ...withId, children: node.children.map(withNodeIds) };
};

/** Table cells need ids too: the table plugin keys each cell's row and column by `id`. */
const withRootNodeIds = (nodes: any[]) => nodes.map(withNodeIds);

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

export function normalizeLinksInCodeBlocks(node: RichTextNode): RichTextNode {
  if (!Array.isArray(node.children)) return node;
  const children: RichTextNode[] = node.children;
  if (node.type === 'code_line') {
    return {
      ...node,
      children: children.flatMap((child) => {
        if (child.type === 'a') {
          return Array.isArray(child.children) ? child.children : [];
        }
        return [normalizeLinksInCodeBlocks(child)];
      }),
    };
  }
  return { ...node, children: children.map(normalizeLinksInCodeBlocks) };
}

export const helpers = {
  isNodeActive,
  isListActive,
  currentNodeSupportsMDX,
  normalize,
  normalizeLinksInCodeBlocks,
  withRootNodeIds,
};
