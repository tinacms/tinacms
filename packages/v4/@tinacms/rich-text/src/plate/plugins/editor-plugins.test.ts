import { createPlateEditor } from '@udecode/plate/react';
import type { KeyboardEvent } from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from './editor-plugins';

const RED = '#DC2626';

const pressEnterAt = (offset: number) => {
  const editor = createPlateEditor({
    plugins: createEditorPlugins(),
    value: [{ type: 'p', children: [{ text: 'hello world', textColor: RED }] }],
  });
  editor.tf.select({ path: [0, 0], offset });
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
});
