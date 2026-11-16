import { act, cleanup, render } from '@testing-library/react';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import { TooltipProvider } from './components/plate-ui/tooltip';
import { createEditorPlugins } from './plugins/editor-plugins';
import { Components } from './plugins/ui/components';
import { ToolbarProvider } from './toolbar/toolbar-provider';

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const value: Value = [
  { type: 'p', children: [{ text: 'Hello world' }] },
  { type: 'p', children: [{ text: '' }] },
];

const Harness = ({
  readOnly,
  onEditorReady,
}: {
  readOnly: boolean;
  onEditorReady: (editor: HarnessEditor) => void;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins({}),
    value,
    components: Components(),
  });
  onEditorReady(editor);
  return (
    <TooltipProvider>
      <ToolbarProvider templates={[]} overrides={undefined}>
        <Plate editor={editor} readOnly={readOnly}>
          <PlateContent />
        </Plate>
      </ToolbarProvider>
    </TooltipProvider>
  );
};

const mount = async (readOnly: boolean) => {
  let editor: HarnessEditor | undefined;
  render(
    <Harness
      readOnly={readOnly}
      onEditorReady={(next) => {
        editor = next;
      }}
    />
  );
  if (!editor) throw new Error('harness did not expose an editor');
  return editor;
};

const editable = () => document.querySelector<HTMLElement>('[contenteditable]');

/** Selects "Hello" with the editor focused, then waits for the floating toolbar. */
const selectHello = async (editor: HarnessEditor) => {
  await act(async () => {
    editable()?.focus();
    editor.tf.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  return document.body.querySelectorAll('[role=toolbar]').length;
};

describe('Plate menus', () => {
  it('shows the floating toolbar over a selection when editable', async () => {
    const editor = await mount(false);
    expect(await selectHello(editor)).toBe(1);
  });

  it('never shows the floating toolbar over a selection when read-only', async () => {
    const editor = await mount(true);
    expect(await selectHello(editor)).toBe(0);
  });

  // happy-dom does not turn a typed "/" into a Slate edit, so the slash menu
  // is checked at its only entry: the DOM text input that read-only turns off.
  it('turns the text input off when read-only, which closes the only way to the slash menu', async () => {
    await mount(false);
    expect(editable()).toHaveAttribute('contenteditable', 'true');
    cleanup();

    await mount(true);
    expect(editable()).toHaveAttribute('contenteditable', 'false');
  });
});
