import { render, screen } from '@testing-library/react';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { INVALID_MARKDOWN_TYPE } from '../../../error-message';
import { createEditorPlugins } from '../editor-plugins';

type HarnessEditor = ReturnType<typeof usePlateEditor>;

const invalidDocument: Value = [
  {
    type: INVALID_MARKDOWN_TYPE,
    value: '<<< broken',
    message: 'Could not parse the block',
    position: { start: { line: 4, column: 7 }, end: { line: 4, column: 12 } },
    children: [{ text: '' }],
  },
];

const Harness = ({
  onEditorReady,
}: {
  onEditorReady: (editor: HarnessEditor) => void;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins(),
    value: invalidDocument,
  });
  onEditorReady(editor);

  return (
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
};

const renderInvalidMarkdown = () => {
  let editor: HarnessEditor | undefined;
  render(
    <Harness
      onEditorReady={(next) => {
        editor = next;
      }}
    />
  );
  if (!editor) {
    throw new Error('harness did not expose an editor');
  }
  return editor;
};

/**
 * `createInvalidMarkdownPlugin` declares `isElement`, `isVoid` and `isInline`
 * under `options`. Plate reads node behaviour from `node`, so it registers no
 * element for this key and never mounts `InvalidMarkdownElement`. The block
 * renders as an empty div: the author sees an empty editor where their
 * content was, and no message that says why.
 *
 * Every case below is marked `fails` and asserts the behaviour the plugin
 * intends. Moving the three flags under `node` turns them all red at once,
 * which is the signal to change each `it.fails` back to `it`.
 */
describe('invalid markdown element', () => {
  it.fails('shows the parser message and the line it failed on', () => {
    renderInvalidMarkdown();

    expect(
      screen.getByText('Could not parse the block at line: 4, column: 7')
    ).toBeInTheDocument();
  });

  it.fails('names the failure in a heading', () => {
    renderInvalidMarkdown();

    expect(
      screen.getByRole('heading', { name: /Error parsing markdown/ })
    ).toBeInTheDocument();
  });

  it.fails('tells the author their markdown is kept as it is', () => {
    renderInvalidMarkdown();

    expect(screen.getByText(/kept as-is until it parses/)).toBeInTheDocument();
  });

  it.fails('treats the error box as a void the author cannot type into', () => {
    const editor = renderInvalidMarkdown();

    expect(editor.api.isVoid(editor.children[0])).toBe(true);
  });

  /**
   * A second, separate defect: `AGENTS.md` requires `role='alert'` on an error
   * message. This one survives the fix above, so it needs its own change.
   */
  it.fails('carries the alert role', () => {
    renderInvalidMarkdown();

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
