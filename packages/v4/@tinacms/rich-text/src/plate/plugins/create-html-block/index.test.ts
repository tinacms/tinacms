import type { Value } from '@udecode/plate';
import { SoftBreakPlugin } from '@udecode/plate-break/react';
import { createPlateEditor } from '@udecode/plate/react';
import type { KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ELEMENT_BREAK, KEY_HARD_BREAK, createHardBreakPlugin } from '.';
import { createEditorPlugins } from '../editor-plugins';

const makeEditor = (value: Value) => {
  const editor = createPlateEditor({
    plugins: createEditorPlugins(),
    value,
  });
  return editor;
};

const blockquoteDocument: Value = [
  { type: 'blockquote', children: [{ text: 'quoted' }] },
];

const paragraphDocument: Value = [{ type: 'p', children: [{ text: 'plain' }] }];

const pressKey = (
  editor: ReturnType<typeof makeEditor>,
  key: string,
  modifiers: { shiftKey?: boolean; metaKey?: boolean } = {}
): { preventDefault: ReturnType<typeof vi.fn> } => {
  const event = {
    key,
    shiftKey: false,
    metaKey: false,
    ctrlKey: false,
    ...modifiers,
    preventDefault: vi.fn(),
  };
  const handler = createHardBreakPlugin.handlers?.onKeyDown;
  if (typeof handler !== 'function') {
    throw new Error('the plugin registers no keydown handler');
  }
  handler({
    editor,
    event: event as unknown as KeyboardEvent<HTMLDivElement>,
  } as unknown as Parameters<typeof handler>[0]);
  return event;
};

const countBreaks = (editor: ReturnType<typeof makeEditor>) =>
  JSON.stringify(editor.children).split(`"${ELEMENT_BREAK}"`).length - 1;

const codeBlockDocument: Value = [
  {
    type: 'code_block',
    children: [{ type: 'code_line', children: [{ text: 'const x' }] }],
  },
];

const tableDocument: Value = [
  {
    type: 'table',
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
];

describe('hard break', () => {
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

  /**
   * Plate's SoftBreakPlugin puts a literal "\n" in the text. Markdown re-flows
   * that into a space, and the author's line break is lost on save.
   */
  it('inserts a break on shift+Enter in a paragraph', () => {
    const editor = makeEditor(paragraphDocument);
    editor.tf.select({ path: [0, 0], offset: 5 });

    const event = pressKey(editor, 'Enter', { shiftKey: true });

    expect(countBreaks(editor)).toBe(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('leaves a code block alone, because it needs a real newline', () => {
    const editor = makeEditor(codeBlockDocument);
    editor.tf.select({ path: [0, 0, 0], offset: 7 });

    const event = pressKey(editor, 'Enter', { shiftKey: true });

    expect(countBreaks(editor)).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('leaves a table cell alone, because GFM cannot hold a hard break', () => {
    const editor = makeEditor(tableDocument);
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 4 });

    const event = pressKey(editor, 'Enter', { shiftKey: true });

    expect(countBreaks(editor)).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('leaves mod+Enter in a blockquote to ExitBreakPlugin', () => {
    const editor = makeEditor(blockquoteDocument);
    editor.tf.select({ path: [0, 0], offset: 6 });

    const event = pressKey(editor, 'Enter', { metaKey: true });

    expect(countBreaks(editor)).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  /**
   * A blockquote holds one paragraph. Enter must stay inside the quote and
   * add a line, or every line of a pasted quotation becomes its own block.
   */
  it('inserts a break instead of leaving the quote', () => {
    const editor = makeEditor(blockquoteDocument);
    editor.tf.select({ path: [0, 0], offset: 6 });

    const event = pressKey(editor, 'Enter');

    expect(countBreaks(editor)).toBe(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('leaves Enter alone outside a blockquote', () => {
    const editor = makeEditor(paragraphDocument);
    editor.tf.select({ path: [0, 0], offset: 5 });

    const event = pressKey(editor, 'Enter');

    expect(countBreaks(editor)).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('leaves a key that is not Enter alone inside a blockquote', () => {
    const editor = makeEditor(blockquoteDocument);
    editor.tf.select({ path: [0, 0], offset: 6 });

    const event = pressKey(editor, 'a');

    expect(countBreaks(editor)).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not throw when there is no selection', () => {
    const editor = makeEditor(blockquoteDocument);
    editor.tf.deselect();

    expect(() => pressKey(editor, 'Enter')).not.toThrow();
    expect(countBreaks(editor)).toBe(0);
  });
});

describe('html element nodes', () => {
  /**
   * Raw HTML round-trips as one opaque string. An editable node lets Slate
   * split the markup mid-tag, which writes markup the author never typed.
   */
  it('treats an html block as a void the author cannot type into', () => {
    const editor = makeEditor([
      { type: 'html', value: '<table></table>', children: [{ text: '' }] },
    ]);

    expect(editor.api.isVoid(editor.children[0])).toBe(true);
  });

  it('keeps an html block on its own line', () => {
    const editor = makeEditor([
      { type: 'html', value: '<table></table>', children: [{ text: '' }] },
    ]);

    expect(editor.api.isInline(editor.children[0])).toBe(false);
  });

  it('keeps an inline html element inside the paragraph that holds it', () => {
    const editor = makeEditor([
      {
        type: 'p',
        children: [
          { text: 'a' },
          { type: 'html_inline', value: '<br>', children: [{ text: '' }] },
        ],
      },
    ]);
    const inline = editor.children[0].children[1];

    expect(editor.api.isInline(inline)).toBe(true);
    expect(editor.api.isVoid(inline)).toBe(true);
  });
});
