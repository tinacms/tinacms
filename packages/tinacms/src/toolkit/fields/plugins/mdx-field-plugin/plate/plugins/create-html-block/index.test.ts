import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { SoftBreakPlugin } from '@udecode/plate-break/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { createPlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../editor-plugins';
import {
  ELEMENT_BREAK,
  KEY_HARD_BREAK,
  createBreakPlugin,
  createHardBreakPlugin,
} from './index';

const pressEnter = (
  value: any[],
  path: number[],
  modifiers: { shiftKey?: boolean; metaKey?: boolean } = {}
) => {
  const editor = createPlateEditor({
    plugins: [
      BlockquotePlugin,
      CodeBlockPlugin,
      TablePlugin,
      createBreakPlugin,
      createHardBreakPlugin,
    ],
    value,
  });
  const point = { path, offset: 3 };
  editor.tf.select({ anchor: point, focus: point });

  let defaultPrevented = false;
  const event = {
    key: 'Enter',
    shiftKey: false,
    metaKey: false,
    ctrlKey: false,
    ...modifiers,
    preventDefault: () => {
      defaultPrevented = true;
    },
  };
  createHardBreakPlugin.handlers.onKeyDown({ editor, event } as any);

  return { defaultPrevented, value: editor.children };
};

const hasBreak = (node: any): boolean =>
  node.type === ELEMENT_BREAK ||
  (Array.isArray(node.children) && node.children.some(hasBreak));

const paragraph = [{ type: 'p', children: [{ text: 'one two' }] }];

describe('createHardBreakPlugin', () => {
  /**
   * Nothing stops a double insert except order: this plugin calls
   * preventDefault, and Plate's SoftBreakPlugin ignores an event that is
   * already handled. Reorder the array and every shift+Enter writes both a
   * break element and a literal newline.
   */
  it('is registered before Plate SoftBreakPlugin', () => {
    const keys = createEditorPlugins().map(
      (plugin: { key: string }) => plugin.key
    );

    expect(keys).toContain(KEY_HARD_BREAK);
    expect(keys.indexOf(KEY_HARD_BREAK)).toBeLessThan(
      keys.indexOf(SoftBreakPlugin.key)
    );
  });

  it('inserts a break element on shift+Enter in a paragraph', () => {
    const { defaultPrevented, value } = pressEnter(paragraph, [0, 0], {
      shiftKey: true,
    });
    expect(defaultPrevented).toBe(true);
    expect(value.some(hasBreak)).toBe(true);
  });

  it('leaves a plain Enter in a paragraph alone', () => {
    const { defaultPrevented, value } = pressEnter(paragraph, [0, 0]);
    expect(defaultPrevented).toBe(false);
    expect(value.some(hasBreak)).toBe(false);
  });

  it('still inserts a break on plain Enter inside a blockquote', () => {
    const { defaultPrevented, value } = pressEnter(
      [
        {
          type: BlockquotePlugin.key,
          children: [{ type: 'p', children: [{ text: 'quoted' }] }],
        },
      ],
      [0, 0, 0]
    );
    expect(defaultPrevented).toBe(true);
    expect(value.some(hasBreak)).toBe(true);
  });

  it('leaves code blocks to SoftBreakPlugin so they keep real newlines', () => {
    const { defaultPrevented, value } = pressEnter(
      [
        {
          type: CodeBlockPlugin.key,
          children: [{ type: 'code_line', children: [{ text: 'const x' }] }],
        },
      ],
      [0, 0, 0],
      { shiftKey: true }
    );
    expect(defaultPrevented).toBe(false);
    expect(value.some(hasBreak)).toBe(false);
  });

  it('leaves table cells alone — GFM cells cannot hold a hard break', () => {
    const { defaultPrevented, value } = pressEnter(
      [
        {
          type: TablePlugin.key,
          children: [
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  children: [{ type: 'p', children: [{ text: 'cell' }] }],
                },
              ],
            },
          ],
        },
      ],
      [0, 0, 0, 0, 0],
      { shiftKey: true }
    );
    expect(defaultPrevented).toBe(false);
    expect(value.some(hasBreak)).toBe(false);
  });

  it('leaves mod+Enter to ExitBreakPlugin inside a blockquote', () => {
    const { defaultPrevented } = pressEnter(
      [
        {
          type: BlockquotePlugin.key,
          children: [{ type: 'p', children: [{ text: 'quoted' }] }],
        },
      ],
      [0, 0, 0],
      { metaKey: true }
    );
    expect(defaultPrevented).toBe(false);
  });
});
