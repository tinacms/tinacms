import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../plugins/editor-plugins';
import { Components } from '../plugins/ui/components';
import { ToolbarProvider } from '../toolbar/toolbar-provider';
import { TooltipProvider } from './plate-ui/tooltip';

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const Harness = ({
  value,
  headingLevels,
  onEditorReady,
}: {
  value: Value;
  headingLevels?: ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')[];
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
      <ToolbarProvider templates={[]} overrides={{ headingLevels }}>
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      </ToolbarProvider>
    </TooltipProvider>
  );
};

const mount = (
  value: Value,
  headingLevels?: ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')[]
) => {
  let editor: HarnessEditor | undefined;
  render(
    <Harness
      value={value}
      headingLevels={headingLevels}
      onEditorReady={(next) => {
        editor = next;
      }}
    />
  );
  if (!editor) throw new Error('harness did not expose an editor');
  return editor;
};

const emptyParagraph: Value = [{ type: 'p', children: [{ text: '' }] }];

const openSlashMenu = async (editor: HarnessEditor) => {
  await act(async () => {
    editor.tf.select({ path: [0, 0], offset: 0 });
    editor.tf.insertText('/');
  });
  return screen.findByRole('listbox');
};

describe('the / menu', () => {
  it('lists each command with its Markdown shortcut as a hint', async () => {
    const editor = mount(emptyParagraph);
    const menu = await openSlashMenu(editor);

    const heading = within(menu).getByRole('option', { name: /Heading 1/ });
    expect(heading).toHaveTextContent('#');
    const list = within(menu).getByRole('option', { name: /Bulleted list/ });
    expect(list).toHaveTextContent('-');
    expect(
      within(menu).getByRole('option', { name: /Numbered list/ })
    ).toHaveTextContent('1.');
  });

  it('narrows to the commands that match what is typed', async () => {
    const editor = mount(emptyParagraph);
    const menu = await openSlashMenu(editor);

    await userEvent.type(screen.getByRole('combobox'), 'bull');

    await waitFor(() =>
      expect(within(menu).queryAllByRole('option')).toHaveLength(1)
    );
    expect(
      within(menu).getByRole('option', { name: /Bulleted list/ })
    ).toBeInTheDocument();
  });

  it('says so when nothing matches', async () => {
    const editor = mount(emptyParagraph);
    await openSlashMenu(editor);

    await userEvent.type(screen.getByRole('combobox'), 'zzzz');

    expect(
      await screen.findByText('No matching commands found')
    ).toBeInTheDocument();
  });

  it('lists only the heading levels the schema allows', async () => {
    const editor = mount(emptyParagraph, ['h2', 'h3']);
    const menu = await openSlashMenu(editor);

    const names = within(menu)
      .getAllByRole('option')
      .map((option) => option.textContent ?? '');
    expect(names.some((name) => name.includes('Heading 1'))).toBe(false);
    expect(names.some((name) => name.includes('Heading 2'))).toBe(true);
    expect(names.some((name) => name.includes('Heading 3'))).toBe(true);
  });
});

describe('the / menu in a table', () => {
  const tableValue: Value = [
    {
      type: 'table',
      children: [
        {
          type: 'tr',
          children: [
            { type: 'td', children: [{ type: 'p', children: [{ text: '' }] }] },
          ],
        },
      ],
    },
  ];

  it('greys the heading rows and leaves them unusable', async () => {
    const user = userEvent.setup();
    const editor = mount(tableValue);
    await act(async () => {
      editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 0 });
      editor.tf.insertText('/');
    });
    const menu = await screen.findByRole('listbox');

    const heading = within(menu).getByRole('option', { name: /Heading 1/ });
    expect(heading).toHaveAttribute('aria-disabled', 'true');
    await user.click(heading);

    const types = editor.api.nodes({ match: { type: 'h1' } });
    expect([...types]).toHaveLength(0);
    expect(
      within(menu).getByRole('option', { name: /Bulleted list/ })
    ).not.toHaveAttribute('aria-disabled', 'true');
  });
});

describe('the code language picker', () => {
  const codeValue: Value = [
    {
      type: 'code_block',
      lang: 'javascript',
      children: [{ type: 'code_line', children: [{ text: 'const a = 1;' }] }],
    },
  ];

  it('ticks the current language and changes it when another is picked', async () => {
    const user = userEvent.setup();
    const editor = mount(codeValue);

    await user.click(screen.getByRole('combobox', { name: 'Code language' }));
    const current = await screen.findByRole('option', { name: 'JavaScript' });
    expect(current).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('option', { name: 'Python' })).not.toHaveAttribute(
      'aria-current'
    );

    await user.type(screen.getByPlaceholderText('Search language...'), 'pyth');
    await user.click(await screen.findByRole('option', { name: 'Python' }));

    await waitFor(() =>
      expect((editor.children[0] as { lang?: string }).lang).toBe('python')
    );
  });

  it('keeps Format code beside the language', () => {
    mount([
      {
        type: 'code_block',
        lang: 'json',
        children: [{ type: 'code_line', children: [{ text: '{}' }] }],
      },
    ]);

    expect(
      screen.getByRole('button', { name: 'Format code' })
    ).toBeInTheDocument();
  });
});

describe('raw HTML', () => {
  it('names the locked block so it is known to be edited in the file', () => {
    mount([{ type: 'html', value: '<div>hi</div>', children: [{ text: '' }] }]);

    const block = screen.getByRole('group', {
      name: 'Raw HTML, edit it in the file',
    });
    expect(block).toHaveTextContent('<div>hi</div>');
  });
});
