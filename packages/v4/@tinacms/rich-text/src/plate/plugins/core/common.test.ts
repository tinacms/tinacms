import { type Value, createSlateEditor } from '@udecode/plate';
import type { PlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import { ELEMENT_IMG } from '../create-img-plugin';
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins';
import {
  helpers,
  insertBlockElement,
  insertInlineElement,
  normalizeLinksInCodeBlocks,
} from './common';

interface TestNode {
  type?: string;
  text?: string;
  id?: string;
  children?: TestNode[];
}

const makeEditor = (value: Value) =>
  createSlateEditor({
    plugins: [],
    value,
  }) as unknown as PlateEditor;

describe('helpers.normalize', () => {
  /**
   * A void node must hold exactly one empty text child. Slate throws when it
   * walks a void node that holds real children, so a document that arrives
   * with props inside an embed must lose them before the editor mounts.
   */
  it.each([ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG])(
    'replaces the children of a %s with one empty text node',
    (type) => {
      const node = {
        type,
        name: 'Banner',
        children: [{ type: 'p', children: [{ text: 'stale' }] }],
      };

      expect(helpers.normalize(node)).toEqual({
        type,
        name: 'Banner',
        children: [{ type: 'text', text: '' }],
      });
    }
  );

  it('gives a block with an empty children array one empty text node', () => {
    expect(helpers.normalize({ type: 'p', children: [] })).toEqual({
      type: 'p',
      children: [{ text: '' }],
    });
  });

  it('normalizes an embed nested below the root', () => {
    const node = {
      type: 'blockquote',
      children: [
        {
          type: ELEMENT_MDX_BLOCK,
          children: [{ type: 'p', children: [{ text: 'stale' }] }],
        },
      ],
    };

    expect(helpers.normalize(node)).toEqual({
      type: 'blockquote',
      children: [
        { type: ELEMENT_MDX_BLOCK, children: [{ type: 'text', text: '' }] },
      ],
    });
  });

  it('keeps a text leaf and its marks', () => {
    const leaf = { text: 'hello', bold: true };

    expect(helpers.normalize(leaf)).toEqual(leaf);
  });
});

describe('helpers.withRootNodeIds', () => {
  it('gives an id to every node that has none', () => {
    const result = helpers.withRootNodeIds([
      { type: 'p', children: [{ text: 'a' }] },
      { type: 'p', children: [{ text: 'b' }] },
    ]);

    expect(result.every((node: TestNode) => Boolean(node.id))).toBe(true);
  });

  /**
   * Plate keys a node by its id. Two nodes that share an id make React reuse
   * one DOM subtree for both, so an edit to one shows up on the other.
   */
  it('gives each node a different id', () => {
    const result = helpers.withRootNodeIds([
      { type: 'p', children: [{ text: 'a' }] },
      { type: 'p', children: [{ text: 'b' }] },
      { type: 'p', children: [{ text: 'c' }] },
    ]);

    const ids = result.map((node: TestNode) => node.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('keeps an id that the node already has', () => {
    const result = helpers.withRootNodeIds([
      { type: 'p', id: 'kept', children: [{ text: 'a' }] },
    ]);

    expect(result[0].id).toBe('kept');
  });

  it('does not mutate the node it receives', () => {
    const node = { type: 'p', children: [{ text: 'a' }] };

    helpers.withRootNodeIds([node]);

    expect(node).not.toHaveProperty('id');
  });
});

describe('normalizeLinksInCodeBlocks', () => {
  /**
   * A code line stores its text as plain leaves. A link element inside one
   * round-trips to markdown as `[text](url)` inside a fence, which changes
   * the code the author wrote.
   */
  it('unwraps a link inside a code line and keeps its text', () => {
    const node = {
      type: 'code_line',
      children: [
        { text: 'see ' },
        {
          type: 'a',
          url: 'https://x.test',
          children: [{ text: 'https://x.test' }],
        },
      ],
    };

    expect(normalizeLinksInCodeBlocks(node)).toEqual({
      type: 'code_line',
      children: [{ text: 'see ' }, { text: 'https://x.test' }],
    });
  });

  it('drops a link inside a code line that has no children', () => {
    const node = {
      type: 'code_line',
      children: [{ type: 'a', url: 'https://x.test' }],
    };

    expect(normalizeLinksInCodeBlocks(node)).toEqual({
      type: 'code_line',
      children: [],
    });
  });

  it('reaches a code line nested inside a code block', () => {
    const node = {
      type: 'code_block',
      children: [
        {
          type: 'code_line',
          children: [
            { type: 'a', url: 'https://x.test', children: [{ text: 'x' }] },
          ],
        },
      ],
    };

    expect(normalizeLinksInCodeBlocks(node)).toEqual({
      type: 'code_block',
      children: [{ type: 'code_line', children: [{ text: 'x' }] }],
    });
  });

  it('keeps a link that sits outside a code line', () => {
    const node = {
      type: 'p',
      children: [
        { type: 'a', url: 'https://x.test', children: [{ text: 'x' }] },
      ],
    };

    expect(normalizeLinksInCodeBlocks(node)).toEqual(node);
  });
});

describe('insertInlineElement', () => {
  it('inserts the element at the selection', () => {
    const editor = makeEditor([{ type: 'p', children: [{ text: 'ab' }] }]);
    editor.tf.select({ path: [0, 0], offset: 1 });

    insertInlineElement(editor, {
      type: ELEMENT_MDX_INLINE,
      name: 'Cta',
      children: [{ text: '' }],
    });

    expect(JSON.stringify(editor.children)).toContain(ELEMENT_MDX_INLINE);
  });
});

describe('insertBlockElement', () => {
  /**
   * An author who opens the embed menu on a fresh empty paragraph expects the
   * embed to take that paragraph, not to leave an empty one above it.
   */
  it('replaces an empty block instead of adding one below it', () => {
    const editor = makeEditor([{ type: 'p', children: [{ text: '' }] }]);
    editor.tf.select({ path: [0, 0], offset: 0 });

    insertBlockElement(editor, {
      type: ELEMENT_MDX_BLOCK,
      name: 'Banner',
      children: [{ text: '' }],
    });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0].type).toBe(ELEMENT_MDX_BLOCK);
  });

  it('adds a block when the current block holds text', () => {
    const editor = makeEditor([{ type: 'p', children: [{ text: 'keep me' }] }]);
    editor.tf.select({ path: [0, 0], offset: 7 });

    insertBlockElement(editor, {
      type: ELEMENT_MDX_BLOCK,
      name: 'Banner',
      children: [{ text: '' }],
    });

    expect(editor.children).toHaveLength(2);
    expect(JSON.stringify(editor.children)).toContain('keep me');
  });

  /**
   * `isCurrentBlockEmpty` reads `editor.api.block()[1]` with no guard of its
   * own. This early return is the only thing that keeps that read from
   * throwing on a null block, so it is a contract, not an optimisation.
   */
  it('makes no change and does not throw when there is no selection', () => {
    const editor = makeEditor([{ type: 'p', children: [{ text: 'keep me' }] }]);
    editor.tf.deselect();
    const before = JSON.stringify(editor.children);

    expect(() =>
      insertBlockElement(editor, {
        type: ELEMENT_MDX_BLOCK,
        name: 'Banner',
        children: [{ text: '' }],
      })
    ).not.toThrow();

    expect(JSON.stringify(editor.children)).toBe(before);
  });
});
