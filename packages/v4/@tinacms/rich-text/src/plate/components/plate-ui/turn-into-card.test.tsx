import { act, render, screen, waitFor } from '@testing-library/react';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../../plugins/editor-plugins';
import { Components } from '../../plugins/ui/components';
import { ToolbarProvider } from '../../toolbar/toolbar-provider';
import { TooltipProvider } from './tooltip';

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const cell = (text: string) => ({
  type: 'td',
  children: [{ type: 'p', children: [{ text }] }],
});

const value: Value = [
  { type: 'p', children: [{ text: 'plain words here' }] },
  {
    type: 'table',
    children: [
      { type: 'tr', children: [cell('alpha beta'), cell('gamma delta')] },
    ],
  },
];

const mount = () => {
  const ref: { editor?: HarnessEditor } = {};
  const Harness = () => {
    const editor = usePlateEditor({
      plugins: createEditorPlugins(),
      value,
      components: Components(),
    });
    ref.editor = editor;
    return (
      <TooltipProvider>
        <ToolbarProvider templates={[]} overrides={undefined}>
          <Plate editor={editor}>
            <PlateContent />
          </Plate>
        </ToolbarProvider>
      </TooltipProvider>
    );
  };
  render(<Harness />);
  if (!ref.editor) throw new Error('editor not created');
  return ref.editor;
};

const selectRange = (
  editor: HarnessEditor,
  anchor: { path: number[]; offset: number },
  focus: { path: number[]; offset: number }
) =>
  act(async () => {
    editor.tf.select({ anchor, focus });
    editor.tf.focus();
  });

const card = () => screen.queryByRole('toolbar', { name: 'Turn into' });

describe('Turn into card', () => {
  it('shows for words in a paragraph', async () => {
    const editor = mount();
    await selectRange(
      editor,
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 5 }
    );
    await waitFor(() => expect(card()).not.toBeNull());
  });

  it('stays hidden for words inside one table cell', async () => {
    const editor = mount();
    await selectRange(
      editor,
      { path: [1, 0, 0, 0, 0], offset: 0 },
      { path: [1, 0, 0, 0, 0], offset: 5 }
    );
    await new Promise((r) => setTimeout(r, 100));
    expect(card()).toBeNull();
  });

  it('stays hidden for a selection across cells', async () => {
    const editor = mount();
    await selectRange(
      editor,
      { path: [1, 0, 0, 0, 0], offset: 2 },
      { path: [1, 0, 1, 0, 0], offset: 3 }
    );
    await new Promise((r) => setTimeout(r, 100));
    expect(card()).toBeNull();
  });
});
