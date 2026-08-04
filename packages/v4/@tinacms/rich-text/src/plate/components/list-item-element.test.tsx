import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../plugins/editor-plugins';
import { Components } from '../plugins/ui/components';

const item = (text: string, checked?: boolean) => ({
  type: 'li',
  ...(checked === undefined ? {} : { checked }),
  children: [{ type: 'lic', children: [{ text }] }],
});

const list = (...items: ReturnType<typeof item>[]): Value => [
  { type: 'ul', children: items },
];

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const Harness = ({
  value,
  onEditorReady,
}: {
  value: Value;
  onEditorReady: (editor: HarnessEditor) => void;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins(),
    value,
    components: Components(),
  });

  onEditorReady(editor);

  return (
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
};

const renderList = (value: Value): { editor: HarnessEditor } => {
  let editor: HarnessEditor | undefined;

  render(
    <Harness
      value={value}
      onEditorReady={(next) => {
        editor = next;
      }}
    />
  );

  if (!editor) {
    throw new Error('harness did not expose an editor');
  }

  return { editor };
};

const firstItem = (editor: HarnessEditor) =>
  (editor.children[0] as { children: { checked?: boolean }[] }).children[0];

describe('a task list item', () => {
  it('draws an unchecked box for a checked:false item', () => {
    renderList(list(item('buy milk', false)));

    expect(screen.getByRole('checkbox', { name: 'buy milk' })).not.toBeChecked();
  });

  it('draws a checked box for a checked:true item', () => {
    renderList(list(item('call mum', true)));

    expect(screen.getByRole('checkbox', { name: 'call mum' })).toBeChecked();
  });

  it('writes the new state into the editor value when the box is toggled', async () => {
    const user = userEvent.setup();
    const { editor } = renderList(list(item('buy milk', false)));

    await user.click(screen.getByRole('checkbox', { name: 'buy milk' }));

    await waitFor(() => expect(firstItem(editor).checked).toBe(true));
  });

  it('clears the state again when a checked box is toggled', async () => {
    const user = userEvent.setup();
    const { editor } = renderList(list(item('call mum', true)));

    await user.click(screen.getByRole('checkbox', { name: 'call mum' }));

    await waitFor(() => expect(firstItem(editor).checked).toBe(false));
  });
});

describe('an ordinary list item', () => {
  it('draws no checkbox', () => {
    renderList(list(item('buy milk')));

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText('buy milk')).toBeInTheDocument();
  });

  /**
   * A bullet that gains a `checked` key serialises as `* [ ] buy milk`. The
   * render must not write to the value.
   */
  it('gains no checked key from a render', () => {
    const { editor } = renderList(list(item('buy milk')));

    expect(firstItem(editor)).not.toHaveProperty('checked');
  });
});
