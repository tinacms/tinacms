import type { Value } from '@udecode/plate';
import { createPlateEditor } from '@udecode/plate/react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../editor-plugins';
import { ELEMENT_IMG, insertImg } from '.';

interface InsertedNode {
  type?: string;
  url?: string;
  title?: string;
  alt?: string;
  caption?: string;
  children?: { text?: string }[];
}

const paragraph: Value = [{ type: 'p', children: [{ text: '' }] }];

const findNode = (
  nodes: InsertedNode[],
  predicate: (node: InsertedNode) => boolean
): InsertedNode | undefined => {
  for (const node of nodes) {
    if (predicate(node)) {
      return node;
    }
    const found = node.children
      ? findNode(node.children as InsertedNode[], predicate)
      : undefined;
    if (found) {
      return found;
    }
  }
  return undefined;
};

const insert = (src: string, filename: string): InsertedNode => {
  const editor = createPlateEditor({
    plugins: createEditorPlugins(),
    value: paragraph,
  });
  editor.tf.select({ path: [0, 0], offset: 0 });

  insertImg(editor, { id: 'media-1', filename, src });

  const inserted = findNode(
    editor.children as InsertedNode[],
    (node) => node.type === ELEMENT_IMG || node.type === 'a'
  );
  if (!inserted) {
    throw new Error(
      `insertImg inserted neither an image nor a link: ${JSON.stringify(editor.children)}`
    );
  }
  return inserted;
};

describe('insertImg', () => {
  describe('an image file', () => {
    it('becomes an image element that points at the media source', () => {
      const node = insert('/uploads/photo.png', 'photo.png');

      expect(node.type).toBe(ELEMENT_IMG);
      expect(node.url).toBe('/uploads/photo.png');
    });

    /**
     * The nested form edits `caption` and `alt`. A node that arrives without
     * those keys gives the form no field to bind to.
     */
    it('carries empty caption and alt text for the author to fill in', () => {
      const node = insert('/uploads/photo.png', 'photo.png');

      expect(node.caption).toBe('');
      expect(node.alt).toBe('');
    });

    it('holds one empty text child because it is void', () => {
      const node = insert('/uploads/photo.png', 'photo.png');

      expect(node.children).toEqual([{ text: '' }]);
    });
  });

  describe('a file that is not an image', () => {
    /**
     * An `img` tag pointed at a PDF draws a broken image. A file the browser
     * cannot render must become a link the reader can follow instead.
     */
    it('becomes a link, not an image', () => {
      const node = insert('/uploads/report.pdf', 'report.pdf');

      expect(node.type).toBe('a');
      expect(node.url).toBe('/uploads/report.pdf');
    });

    it('shows the filename as the link text', () => {
      const node = insert('/uploads/report.pdf', 'report.pdf');

      expect(node.children).toEqual([{ text: 'report.pdf' }]);
      expect(node.title).toBe('report.pdf');
    });
  });
});
