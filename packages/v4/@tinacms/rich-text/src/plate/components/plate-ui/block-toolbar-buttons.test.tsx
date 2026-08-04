import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../../plugins/editor-plugins';
import { Components } from '../../plugins/ui/components';
import { CodeBlockToolbarButton } from './code-block-toolbar-button';
import { HorizontalRuleToolbarButton } from './hr-toolbar-button';
import { Toolbar } from './toolbar';
import { TooltipProvider } from './tooltip';

const bulletedList: Value = [
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [{ type: 'lic', children: [{ text: 'first' }] }],
      },
      {
        type: 'li',
        children: [{ type: 'lic', children: [{ text: 'second' }] }],
      },
    ],
  },
];

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const Harness = ({
  onEditorReady,
  children,
}: {
  onEditorReady: (editor: HarnessEditor) => void;
  children: React.ReactNode;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins(),
    value: bulletedList,
    components: Components(),
  });

  onEditorReady(editor);

  return (
    <TooltipProvider>
      <Plate editor={editor}>
        <Toolbar>{children}</Toolbar>
        <PlateContent />
      </Plate>
    </TooltipProvider>
  );
};

const renderWithCaretInListItem = (
  children: React.ReactNode
): HarnessEditor => {
  let editor: HarnessEditor | undefined;

  render(
    <Harness
      onEditorReady={(next) => {
        editor = next;
      }}
    >
      {children}
    </Harness>
  );

  if (!editor) {
    throw new Error('harness did not expose an editor');
  }

  editor.tf.select({ path: [0, 1, 0, 0], offset: 0 });

  return editor;
};

type ValueNode = { type?: string; text?: string; children?: ValueNode[] };

const listItemChildTypes = (nodes: readonly ValueNode[]): string[] => {
  const types: string[] = [];
  const walk = (node: ValueNode) => {
    if (node.type === 'li') {
      for (const child of node.children ?? []) {
        types.push(child.type ?? 'text');
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  for (const node of nodes) walk(node);
  if (types.length === 0) {
    throw new Error('the value holds no list item to inspect');
  }
  return types;
};

/**
 * List normalisation gives an `li` a `lic` and a nested list. A block that gets
 * in by another route makes a document that the codec cannot write, so Save
 * fails until the author finds the block and removes it.
 */
const LIST_ITEM_CHILDREN = ['lic', 'ul', 'ol'];

describe('a block button with the caret in a list item', () => {
  it('puts a code block outside the list, not inside the item', async () => {
    const user = userEvent.setup();
    const editor = renderWithCaretInListItem(<CodeBlockToolbarButton />);

    await user.click(screen.getByRole('radio'));

    expect(JSON.stringify(editor.children)).toContain('"code_block"');
    expect(JSON.stringify(editor.children)).toContain('second');
    for (const type of listItemChildTypes(editor.children)) {
      expect(LIST_ITEM_CHILDREN).toContain(type);
    }
  });

  it('puts a horizontal rule outside the list, not inside the item', async () => {
    const user = userEvent.setup();
    const editor = renderWithCaretInListItem(<HorizontalRuleToolbarButton />);

    await user.click(screen.getByRole('radio'));

    expect(JSON.stringify(editor.children)).toContain('"hr"');
    expect(JSON.stringify(editor.children)).toContain('second');
    for (const type of listItemChildTypes(editor.children)) {
      expect(LIST_ITEM_CHILDREN).toContain(type);
    }
  });
});
