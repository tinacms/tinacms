import type { Value } from '@udecode/plate';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { createPlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../../editor-plugins';
import { getAutoformatBlocks } from './autoformat-block';

const paragraph: Value = [{ type: 'p', children: [{ text: '' }] }];

const makeEditor = (headingLevels?: readonly ('h1' | 'h2' | 'h3')[]) => {
  const editor = createPlateEditor({
    plugins: createEditorPlugins({ headingLevels }),
    value: paragraph,
  });
  editor.tf.select({ path: [0, 0], offset: 0 });
  return editor;
};

/**
 * Autoformat reads the text before the cursor on each `insertText`. A single
 * call that carries the whole string never shows the rule its trigger
 * character on its own, so every rule stays silent.
 */
const type = (editor: ReturnType<typeof makeEditor>, text: string) => {
  for (const character of text) {
    editor.tf.insertText(character);
  }
};

const listWithAnEmptySecondItem: Value = [
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ type: 'lic', children: [{ text: 'item' }] }] },
      { type: 'li', children: [{ type: 'lic', children: [{ text: '' }] }] },
    ],
  },
];

const makeListEditor = () => {
  const editor = createPlateEditor({
    plugins: createEditorPlugins(),
    value: listWithAnEmptySecondItem,
  });
  editor.tf.select({ path: [0, 1, 0, 0], offset: 0 });
  return editor;
};

const topType = (editor: ReturnType<typeof makeEditor>) =>
  editor.children[0].type;

const listItem = (editor: ReturnType<typeof makeEditor>) =>
  (editor.children[0] as { children: { type: string; checked?: boolean }[] })
    .children[0];

describe('getAutoformatBlocks', () => {
  it('offers a rule for every heading level by default', () => {
    const matches = getAutoformatBlocks().map((rule) => rule.match);

    expect(matches).toEqual(
      expect.arrayContaining([
        '# ',
        '## ',
        '### ',
        '#### ',
        '##### ',
        '###### ',
      ])
    );
  });

  /**
   * `field.overrides.headingLevels` is the author's contract. A level that is
   * not on the list must have no autoformat rule, or an author types `### `
   * and gets a heading the schema does not allow.
   */
  it('offers no rule for a heading level that is left out', () => {
    const matches = getAutoformatBlocks(['h1', 'h2']).map((rule) => rule.match);

    expect(matches).toContain('# ');
    expect(matches).toContain('## ');
    expect(matches).not.toContain('### ');
  });

  it('keeps the blocks that are not headings when the levels are restricted', () => {
    const types = getAutoformatBlocks(['h1']).map((rule) =>
      'type' in rule ? rule.type : undefined
    );

    expect(types).toContain('blockquote');
    expect(types).toContain('code_block');
    expect(types).toContain(HorizontalRulePlugin.key);
  });
});

describe('block autoformat', () => {
  it.each([
    ['# ', 'h1'],
    ['## ', 'h2'],
    ['### ', 'h3'],
    ['#### ', 'h4'],
    ['##### ', 'h5'],
    ['###### ', 'h6'],
    ['> ', 'blockquote'],
  ])('turns %j into a %s', (shortcut, expected) => {
    const editor = makeEditor();

    type(editor, shortcut);

    expect(topType(editor)).toBe(expected);
  });

  it('leaves a paragraph alone for a heading level the field excludes', () => {
    const editor = makeEditor(['h1', 'h2']);

    type(editor, '### ');

    expect(topType(editor)).toBe('p');
  });
});

describe('list autoformat', () => {
  it.each(['* ', '- '])('turns %j into a bulleted list', (shortcut) => {
    const editor = makeEditor();

    type(editor, shortcut);

    expect(JSON.stringify(editor.children)).toContain('"ul"');
  });

  it.each(['1. ', '1) '])('turns %j into a numbered list', (shortcut) => {
    const editor = makeEditor();

    type(editor, shortcut);

    expect(JSON.stringify(editor.children)).toContain('"ol"');
  });

  it('gives a bulleted list item no checked key', () => {
    const editor = makeEditor();

    type(editor, '- ');

    expect(listItem(editor)).not.toHaveProperty('checked');
  });

  it.each([
    ['[] ', false],
    ['[x] ', true],
  ])('turns %j into a task item that is checked=%s', (shortcut, checked) => {
    const editor = makeEditor();

    type(editor, shortcut);

    expect(topType(editor)).toBe('ul');
    expect(listItem(editor)).toMatchObject({ type: 'li', checked });
  });
});

describe('horizontal rule autoformat', () => {
  it('turns three hyphens into a horizontal rule', () => {
    const editor = makeEditor();

    type(editor, '---');

    expect(topType(editor)).toBe(HorizontalRulePlugin.key);
  });

  /**
   * macOS replaces `--` with an em dash while the author types, so the third
   * keystroke arrives as `—-`. Without this alternative the shortcut fails on
   * a Mac and works everywhere else.
   */
  it('turns an em dash and a hyphen into a horizontal rule', () => {
    const editor = makeEditor();

    type(editor, '—-');

    expect(topType(editor)).toBe(HorizontalRulePlugin.key);
  });

  it('leaves a paragraph alone for a rule that is one character short', () => {
    const editor = makeEditor();

    type(editor, '--');

    expect(topType(editor)).toBe('p');
  });

  it('turns three underscores into a horizontal rule', () => {
    const editor = makeEditor();

    type(editor, '___');

    expect(topType(editor)).toBe(HorizontalRulePlugin.key);
  });

  /**
   * `***` is a thematic break in CommonMark, and it is not a rule here. The
   * block rule would fire while the line reads `***`, which is what an author
   * types on the way to `***bold italic***`.
   */
  it('leaves three asterisks alone so the bold italic mark can run', () => {
    const editor = makeEditor();

    type(editor, '***bold italic***');

    expect(topType(editor)).toBe('p');
    expect(editor.children[0]).toMatchObject({
      children: [{ text: 'bold italic', bold: true, italic: true }],
    });
  });

  /**
   * A horizontal rule is void. The rule must leave a paragraph below it, or
   * the author has nowhere to put the caret and cannot type past the rule.
   */
  it('adds a paragraph below the rule so the author can keep typing', () => {
    const editor = makeEditor();

    type(editor, '---');

    expect(editor.children[1].type).toBe('p');
  });

  /**
   * A rule inside a list item is a shape that `@tinacms/mdx` cannot write and
   * cannot read back. The rule ends the list, as the code block shortcut and
   * the "Turn into" menu already do.
   */
  it.each(['---', '___'])('ends the list for %j in a list item', (shortcut) => {
    const editor = makeListEditor();

    type(editor, shortcut);

    expect(editor.children.map((block) => block.type)).toContain(
      HorizontalRulePlugin.key
    );
    expect(JSON.stringify(editor.children)).toContain('item');
  });
});
