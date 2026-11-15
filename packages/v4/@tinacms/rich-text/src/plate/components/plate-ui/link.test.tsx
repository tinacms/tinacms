import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../../plugins/editor-plugins';
import { Components } from '../../plugins/ui/components';
import { ToolbarProvider } from '../../toolbar/toolbar-provider';
import { LinkToolbarButton } from './link-toolbar-button';
import { Toolbar } from './toolbar';
import { TooltipProvider } from './tooltip';

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const words = (text: string): Value => [{ type: 'p', children: [{ text }] }];

const linked = (url: string): Value => [
  {
    type: 'p',
    children: [
      { text: 'see ' },
      { type: 'a', url, children: [{ text: 'the docs' }] },
      { text: ' now' },
    ],
  },
];

const Harness = ({
  value,
  onEditor,
}: {
  value: Value;
  onEditor: (editor: HarnessEditor) => void;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins(),
    value,
    components: Components(),
  });
  onEditor(editor);
  return (
    <TooltipProvider>
      <ToolbarProvider templates={[]} overrides={undefined}>
        <Plate editor={editor}>
          <Toolbar>
            <LinkToolbarButton />
          </Toolbar>
          <PlateContent />
        </Plate>
      </ToolbarProvider>
    </TooltipProvider>
  );
};

const mount = (value: Value) => {
  let editor: HarnessEditor | undefined;
  render(<Harness value={value} onEditor={(e) => (editor = e)} />);
  if (!editor) throw new Error('editor not created');
  return editor;
};

const select = (
  editor: HarnessEditor,
  path: number[],
  from: number,
  to: number
) => {
  act(() => {
    editor.tf.select({
      anchor: { path, offset: from },
      focus: { path, offset: to },
    });
    editor.tf.focus();
  });
};

const textOf = (editor: HarnessEditor) => editor.api.string([]);
const linkNodes = (editor: HarnessEditor) =>
  Array.from(editor.api.nodes({ match: { type: 'a' }, at: [] }));

describe('Link box', () => {
  it('makes a link with OK and prefills the selected words', async () => {
    const user = userEvent.setup();
    const editor = mount(words('hello world'));
    select(editor, [0, 0], 0, 5);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    expect(
      screen.getByRole('textbox', { name: 'Text to display' })
    ).toHaveValue('hello');
    const input = screen.getByRole('textbox', { name: 'Link' });
    expect(input).toHaveAttribute('type', 'url');
    await user.type(input, 'https://tina.io');
    await user.click(screen.getByRole('button', { name: 'OK' }));

    const [[node]] = linkNodes(editor) as [[{ url?: string }, unknown]];
    expect(node).toMatchObject({ url: 'https://tina.io' });
    expect(textOf(editor)).toBe('hello world');
  });

  it('keeps a bad address in the box with the error and makes no link', async () => {
    const user = userEvent.setup();
    const editor = mount(words('hello world'));
    select(editor, [0, 0], 0, 5);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    const input = screen.getByRole('textbox', { name: 'Link' });
    await user.type(input, 'not a url');
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(/Invalid URL\. Please prefix link/);
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(linkNodes(editor)).toHaveLength(0);
  });

  it('Cancel closes the box and changes nothing', async () => {
    const user = userEvent.setup();
    const editor = mount(words('hello world'));
    select(editor, [0, 0], 0, 5);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Link' }),
      'https://x.io'
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('textbox', { name: 'Link' })).toBeNull();
    expect(linkNodes(editor)).toHaveLength(0);
    expect(textOf(editor)).toBe('hello world');
  });

  it('has no aria-pressed on the Link tool', () => {
    mount(words('hello'));
    expect(screen.getByRole('button', { name: 'Link' })).not.toHaveAttribute(
      'aria-pressed'
    );
  });
});

describe('Link bar', () => {
  it('shows for a caret in a link and hides outside it', async () => {
    const editor = mount(linked('https://tina.io'));
    select(editor, [0, 1, 0], 2, 2);
    expect(await screen.findByRole('toolbar', { name: 'Link' })).toBeVisible();

    select(editor, [0, 0], 1, 1);
    await waitFor(() =>
      expect(screen.queryByRole('toolbar', { name: 'Link' })).toBeNull()
    );
  });

  it('opens the address in a new tab with noopener', async () => {
    const editor = mount(linked('https://tina.io'));
    select(editor, [0, 1, 0], 2, 2);
    const open = await screen.findByRole('link', {
      name: 'Open link in a new tab',
    });
    expect(open).toHaveAttribute('href', 'https://tina.io/');
    expect(open).toHaveAttribute('target', '_blank');
    expect(open.getAttribute('rel')).toContain('noopener');
  });

  it('gives a javascript: link no live href anywhere', async () => {
    const editor = mount(linked('javascript:alert(1)'));
    select(editor, [0, 1, 0], 2, 2);
    const open = await screen.findByRole('button', {
      name: 'Open link in a new tab',
    });
    expect(open).toBeDisabled();
    expect(open).not.toHaveAttribute('href');
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it('Remove unwraps the link and keeps its words', async () => {
    const user = userEvent.setup();
    const editor = mount(linked('https://tina.io'));
    select(editor, [0, 1, 0], 2, 2);
    await user.click(
      await screen.findByRole('button', { name: 'Remove link' })
    );

    expect(linkNodes(editor)).toHaveLength(0);
    expect(textOf(editor)).toBe('see the docs now');
  });

  it('Edit fills the box with the address and words', async () => {
    const user = userEvent.setup();
    const editor = mount(linked('https://tina.io'));
    select(editor, [0, 1, 0], 2, 2);
    await user.click(await screen.findByRole('button', { name: 'Edit link' }));

    expect(screen.getByRole('textbox', { name: 'Link' })).toHaveValue(
      'https://tina.io'
    );
    expect(
      screen.getByRole('textbox', { name: 'Text to display' })
    ).toHaveValue('the docs');
  });
});
