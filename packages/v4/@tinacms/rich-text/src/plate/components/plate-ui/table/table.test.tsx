import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../../../plugins/editor-plugins';
import { Components } from '../../../plugins/ui/components';
import { ToolbarProvider } from '../../../toolbar/toolbar-provider';
import { TooltipProvider } from '../tooltip';
import { DropdownMenu, DropdownMenuContent } from '../dropdown-menu';
import { TableInsertSubMenu } from './table-dropdown-menu';

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const cell = (text: string, type: 'td' | 'th' = 'td') => ({
  type,
  children: [{ type: 'p', children: [{ text }] }],
});

const grid = (rows: number, cols: number): Value => [
  {
    type: 'table',
    children: Array.from({ length: rows }, (_, r) => ({
      type: 'tr',
      children: Array.from({ length: cols }, (_, c) =>
        cell(`r${r + 1}c${c + 1}`)
      ),
    })),
  },
  { type: 'p', children: [{ text: 'after' }] },
];

const Harness = ({
  value,
  readOnly,
  onEditor,
}: {
  value: Value;
  readOnly: boolean;
  onEditor: (editor: HarnessEditor) => void;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins({}),
    value,
    components: Components(),
  });
  onEditor(editor);
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

const mount = (value: Value, readOnly = false) => {
  const ref: { editor?: HarnessEditor } = {};
  render(
    <Harness
      value={value}
      readOnly={readOnly}
      onEditor={(editor) => {
        ref.editor = editor;
      }}
    />
  );
  if (!ref.editor) throw new Error('harness did not expose an editor');
  return ref.editor;
};

const caretIn = async (editor: HarnessEditor, path: number[], offset = 0) => {
  await act(async () => {
    editor.tf.select({ path, offset });
  });
};

const rowCount = () => document.querySelectorAll('tr').length;
const colCount = () => document.querySelectorAll('tr:first-child > td').length;

afterEach(cleanup);

describe('table handles', () => {
  it('names the caret row and column', async () => {
    const editor = mount(grid(3, 3));
    await caretIn(editor, [0, 1, 0, 0, 0]);
    expect(
      await screen.findByRole('button', { name: 'Row 2 actions' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Column 1 actions' })
    ).toBeInTheDocument();
  });

  it('inserts a row below from the row menu', async () => {
    const user = userEvent.setup();
    const editor = mount(grid(3, 3));
    await caretIn(editor, [0, 1, 0, 0, 0]);
    await user.click(
      await screen.findByRole('button', { name: 'Row 2 actions' })
    );
    await user.click(
      await screen.findByRole('menuitem', { name: 'Insert row below' })
    );
    expect(rowCount()).toBe(4);
  });

  it('adds a row and a column from the dashed buttons', async () => {
    const user = userEvent.setup();
    const editor = mount(grid(3, 3));
    await caretIn(editor, [0, 0, 0, 0, 0]);
    await user.click(await screen.findByRole('button', { name: 'Add a row' }));
    expect(rowCount()).toBe(4);
    await user.click(screen.getByRole('button', { name: 'Add a column' }));
    expect(colCount()).toBe(4);
  });

  it('disables deleting the last row and the last column', async () => {
    const user = userEvent.setup();
    const editor = mount(grid(1, 1));
    await caretIn(editor, [0, 0, 0, 0, 0]);
    await user.click(
      await screen.findByRole('button', { name: 'Row 1 actions' })
    );
    expect(
      await screen.findByRole('menuitem', { name: 'Delete row' })
    ).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Delete column' })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('offers the cell actions in a submenu that Escape closes alone', async () => {
    const user = userEvent.setup();
    const editor = mount(grid(2, 2));
    await caretIn(editor, [0, 0, 0, 0, 0]);
    await user.click(
      await screen.findByRole('button', { name: 'Row 1 actions' })
    );
    const cellItem = await screen.findByRole('menuitem', { name: 'Cell' });
    cellItem.focus();
    await user.keyboard('{ArrowRight}');
    expect(
      await screen.findByRole('menuitem', { name: 'Merge cells' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Split cell' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Background color' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Cell borders' })
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menuitem', { name: 'Merge cells' })).toBeNull();
    expect(
      screen.getByRole('menuitem', { name: 'Delete table' })
    ).toBeInTheDocument();
  });

  it('hides the handles when the caret leaves the table', async () => {
    const editor = mount(grid(2, 2));
    await caretIn(editor, [0, 0, 0, 0, 0]);
    await screen.findByRole('button', { name: 'Row 1 actions' });
    await caretIn(editor, [1, 0]);
    expect(screen.queryByRole('button', { name: /actions$/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add a row' })).toBeNull();
  });

  it('draws no handles when read-only', async () => {
    const editor = mount(grid(2, 2), true);
    await caretIn(editor, [0, 0, 0, 0, 0]);
    expect(screen.queryByRole('button', { name: /actions$/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add a row' })).toBeNull();
  });
});

describe('table size grid', () => {
  it('inserts a table of the size the arrow keys pick', async () => {
    const user = userEvent.setup();
    const editor = mount([{ type: 'p', children: [{ text: 'x' }] }]);
    await caretIn(editor, [0, 0]);
    const Menu = () => (
      <DropdownMenu open modal={false}>
        <DropdownMenuContent>
          <TableInsertSubMenu />
        </DropdownMenuContent>
      </DropdownMenu>
    );
    render(<Menu />);
    const trigger = await screen.findByRole('menuitem', { name: 'Table' });
    trigger.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    expect(
      await within(document.body).findByRole('menuitem', {
        name: 'Insert a 3 by 3 table',
      })
    ).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(rowCount()).toBe(3);
    expect(colCount()).toBe(3);
  });
});
