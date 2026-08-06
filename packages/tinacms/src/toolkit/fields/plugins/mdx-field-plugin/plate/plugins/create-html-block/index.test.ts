import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { createPlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import {
  ELEMENT_BREAK,
  createBreakPlugin,
  createSoftBreakPlugin,
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
      createSoftBreakPlugin,
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
  createSoftBreakPlugin.handlers.onKeyDown({ editor, event } as any);

  return { defaultPrevented, value: editor.children };
};

const hasBreak = (node: any): boolean =>
  node.type === ELEMENT_BREAK ||
  (Array.isArray(node.children) && node.children.some(hasBreak));

const paragraph = [{ type: 'p', children: [{ text: 'one two' }] }];

describe('createSoftBreakPlugin', () => {
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
