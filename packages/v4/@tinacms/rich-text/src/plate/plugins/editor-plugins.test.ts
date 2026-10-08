import type { Value } from '@udecode/plate';
import { createPlateEditor } from '@udecode/plate/react';
import type { KeyboardEvent } from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from './editor-plugins';

const RED = '#DC2626';

const paragraph: Value = [
  { type: 'p', children: [{ text: 'hello world', textColor: RED }] },
];

const pressEnterAt = (
  offset: number,
  value: Value = paragraph,
  path = [0, 0]
) => {
  const editor = createPlateEditor({ plugins: createEditorPlugins(), value });
  editor.tf.select({ path, offset });
  editor.currentKeyboardEvent = { key: 'Enter' } as KeyboardEvent;
  editor.tf.insertBreak();
  return editor;
};

describe('Enter in coloured text', () => {
  it('keeps the colour on the half moved to the new paragraph', () => {
    const editor = pressEnterAt('hello '.length);
    expect(editor.children).toMatchObject([
      { type: 'p', children: [{ text: 'hello ', textColor: RED }] },
      { type: 'p', children: [{ text: 'world', textColor: RED }] },
    ]);
  });

  it('starts an uncoloured paragraph from the end of the text', () => {
    const editor = pressEnterAt('hello world'.length);
    expect(editor.children[1]).toEqual(
      expect.objectContaining({ children: [{ text: '' }] })
    );
    expect(editor.api.marks()).not.toHaveProperty('textColor');
  });

  it('starts an uncoloured list item from the end of coloured text', () => {
    const list: Value = [
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [
              {
                type: 'lic',
                children: [{ text: 'hello world', textColor: RED }],
              },
            ],
          },
        ],
      },
    ];
    const editor = pressEnterAt('hello world'.length, list, [0, 0, 0, 0]);
    expect(editor.children[0]).toMatchObject({
      children: [{}, { children: [{ children: [{ text: '' }] }] }],
    });
    expect(editor.api.marks()).not.toHaveProperty('textColor');
  });
});
