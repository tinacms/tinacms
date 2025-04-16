import { ELEMENT_IMG } from '../create-img-plugin';
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins';
import { HANDLES_MDX } from './formatting';
import { type PlateEditor } from '@udecode/plate/react';
import {
  BasicMarksPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { ParagraphPlugin } from '@udecode/plate/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { getListItemEntry } from '@udecode/plate-list';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ListPlugin } from '@udecode/plate-list/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { TablePlugin } from '@udecode/plate-table/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { NodeApi } from '@udecode/plate';

export const plugins = [
  BasicMarksPlugin,
  HeadingPlugin,
  ParagraphPlugin,
  CodeBlockPlugin,
  //TODO : Readd these plugins and make sure they work
  // createHTMLBlockPlugin(),
  // createHTMLInlinePlugin(),
  BlockquotePlugin,
  UnderlinePlugin,
  ListPlugin,
  IndentListPlugin,
  HorizontalRulePlugin,
  // Allows us to do things like copy/paste, remembering the state of the element (like mdx)
  NodeIdPlugin,
  SlashPlugin,
  TablePlugin,
];

export const unsupportedItemsInTable = new Set([
  'Code Block',
  'Unordered List',
  'Ordered List',
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

const normalize = (node: any) => {
  if (
    [ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG].includes(node.type)
  ) {
    return {
      ...node,
      children: [{ type: 'text', text: '' }],
      id: Date.now(),
    };
  }
  if (node.children) {
    if (node.children.length) {
      return {
        ...node,
        children: node.children.map(normalize),
        id: Date.now(),
      };
    }
    // Always supply an empty text leaf
    return {
      ...node,
      children: [{ text: '' }],
      id: Date.now(),
    };
  }
  return node;
};

export const insertInlineElement = (editor, inlineElement) => {
  editor.tf.insertNodes([inlineElement]);
  /**
   * FIXME mdx-setTimeout: setTimeout seems to work, but not sure why it's necessary
   * Without this, the move occurs on the element that was selected
   * _before_ we inserted the node
   */
  // Move selection to the space after the embedded line
  setTimeout(() => {
    editor.tf.move(); //TODO : Test this function in UI, not sure if it works after replace with latest api  function in UI, not sure if it works after replace with latest api
  }, 1);
};
export const insertBlockElement = (editor, blockElement) => {
  const editorEl = editor.toDOMNode(editor, editor);
  if (editorEl) {
    /**
     * FIXME mdx-setTimeout: there must be a better way to do this. When jumping
     * back from a nested form, the entire editor doesn't receive
     * focus, so enable that, but what we also want is to ensure
     * that this node is selected - so do that, too. But there
     * seems to be a race condition where the `editorEl.focus` doesn't
     * happen in time for the Transform to take effect, hence the
     * setTimeout. I _think_ it just needs to queue and the actual
     * ms timeout is irrelevant, but might be worth checking on
     * devices with lower CPUs
     */
    editorEl.focus();
    setTimeout(() => {
      // If empty, replace the current block
      if (isCurrentBlockEmpty(editor)) {
        editor.tf.setNodes(blockElement);
      } else {
        editor.tf.insertNodes([blockElement]);
      }
    }, 1);
  }
};

//TODO : Test this function in UI, not sure if it works after replace with latest api
const isCurrentBlockEmpty = (editor) => {
  if (!editor.selection) {
    return false;
  }
  const [node] = editor.api.node(editor.selection);
  const cursor = editor.selection.focus;
  const blockAbove = editor.api.block();
  const isEmpty =
    !NodeApi.string(node) && //TODO : Test this function in UI, not sure if it works after replace with latest api
    // @ts-ignore bad type from slate
    !node.children?.some((n) => Editor.isInline(editor, n)) &&
    // Only do this if we're at the start of a block
    editor.api.isStart(cursor, blockAbove[1]);

  return isEmpty;
};

/** Specifies node types which mdx can be embedded.
 * This prevents nodes like code blocks from having
 * MDX elements in them, which can't be parsed
 * NOTE: this also excludes block quotes, but probably should
 * allow for that, at the moment blockquotes are strict
 */
const currentNodeSupportsMDX = (editor: PlateEditor) =>
  editor.api.node({
    match: { type: HANDLES_MDX },
  });

export const helpers = {
  isNodeActive,
  isListActive,
  currentNodeSupportsMDX,
  normalize,
};
