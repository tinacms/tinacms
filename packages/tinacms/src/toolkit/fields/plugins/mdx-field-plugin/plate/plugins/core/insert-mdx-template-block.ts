'use client';

import type { PlateEditor } from '@udecode/plate/react';

/**
 * Slate-style "path" helpers without adding dependency on slate.
 * A Path is a number[] like [0, 1, 2]. nextPath([0, 2]) => [0, 3]
 */
type Path = number[];

function isPath(value: unknown): value is Path {
  return Array.isArray(value) && value.every((n) => Number.isInteger(n));
}

function nextPath(path: Path): Path {
  if (!path.length) return [0];
  const p = path.slice();
  p[p.length - 1] += 1;
  return p;
}

function defaultValueForField(field: any) {
  const type = field?.type;

  if (type === 'string') return field?.ui?.defaultValue ?? '';
  if (type === 'number') return field?.ui?.defaultValue ?? 0;
  if (type === 'boolean') return field?.ui?.defaultValue ?? false;

  if (field?.options?.length) {
    const first = field.options[0];
    return typeof first === 'string' ? first : first?.value ?? '';
  }

  if (type === 'object' && Array.isArray(field?.fields)) {
    const o: Record<string, any> = {};
    for (const f of field.fields) o[f.name] = defaultValueForField(f);
    return o;
  }

  if (type === 'list') return [];

  return field?.ui?.defaultValue ?? '';
}

function buildDefaultProps(template: any) {
  const props: Record<string, any> = {};
  const fields = Array.isArray(template?.fields) ? template.fields : [];
  for (const f of fields) {
    if (!f?.name) continue;
    props[f.name] = defaultValueForField(f);
  }
  return props;
}

function normalizeTemplateName(template: any): string | null {
  const name = template?.name ?? template?.label;
  return typeof name === 'string' && name.trim() ? name.trim() : null;
}

function getBlockText(editor: any, blockNode: any, blockPath: Path): string {
  try {
    const s = editor?.api?.string?.(blockPath as any);
    if (typeof s === 'string') return s;
  } catch {
    // ignore
  }

  const children = Array.isArray(blockNode?.children) ? blockNode.children : [];
  return children.map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('');
}

/**
 * Inserts an MDX template block (mdxJsxFlowElement) and tries to clean up the
 * slash-trigger paragraph so user doesn't get an extra empty line above.
 *
 * Does:
 * - insert empty paragraph at end of the document, to keep typing UX.
 * - not insert in the middle (i.e. there is already a next block).
 */
export function insertMdxTemplateBlock(editor: PlateEditor, template: any) {
  const name = normalizeTemplateName(template);
  if (!name) return;

  const props = buildDefaultProps(template);

  editor.tf.withoutNormalizing(() => {
    // Find the current block entry
    const blockEntry = (editor as any)?.api?.block?.();
    if (!blockEntry || !Array.isArray(blockEntry) || blockEntry.length < 2) {
      // Fallback: just insert at selection
      editor.tf.insertNodes(
        {
          type: 'mdxJsxFlowElement',
          name,
          props,
          children: [{ text: '' }],
        } as any,
        { select: true } as any
      );
      return;
    }

    const blockNode = blockEntry[0];
    const blockPath = blockEntry[1];

    // If no valid path, fallback
    if (!isPath(blockPath)) {
      editor.tf.insertNodes(
        {
          type: 'mdxJsxFlowElement',
          name,
          props,
          children: [{ text: '' }],
        } as any,
        { select: true } as any
      );
      return;
    }

    const blockText = getBlockText(editor as any, blockNode, blockPath);
    const looksLikeSlashParagraph =
      typeof blockText === 'string' && blockText.trimStart().startsWith('/');

    const isEmptyParagraph =
      blockNode?.type === 'p' && (blockText ?? '').trim() === '';

    // If in a slash/empty paragraph, replace that block entirely
    if (looksLikeSlashParagraph || isEmptyParagraph) {
      // Determine if this paragraph is the last top-level block
      // by probing the parent at [] and checking if next index exists
      const parentPath: Path = [];
      const currentIndex = blockPath[0];

      let hasNextTopLevelBlock = false;
      try {
        const rootChildren =
          (editor as any)?.children ??
          (editor as any)?.value?.children ??
          (editor as any)?.value;
        if (Array.isArray(rootChildren) && Number.isInteger(currentIndex)) {
          hasNextTopLevelBlock = currentIndex + 1 < rootChildren.length;
        }
      } catch {
        // ignore
      }

      // Prevents extra blank line
      editor.tf.removeNodes({ at: blockPath } as any);

      editor.tf.insertNodes(
        {
          type: 'mdxJsxFlowElement',
          name,
          props,
          children: [{ text: '' }],
        } as any,
        { at: blockPath, select: false } as any
      );

      // Add empty paragraph if at end of document
      if (!hasNextTopLevelBlock) {
        const afterPath = nextPath(blockPath);
        editor.tf.insertNodes(
          { type: 'p', children: [{ text: '' }] } as any,
          { at: afterPath, select: true } as any
        );
      } else {
        // Otherwise, move selection to the inserted MDX block (or keep it stable)
        editor.tf.select(blockPath as any);
      }

      return;
    }

    const insertAt = nextPath(blockPath);

    editor.tf.insertNodes(
      {
        type: 'mdxJsxFlowElement',
        name,
        props,
        children: [{ text: '' }],
      } as any,
      { at: insertAt, select: false } as any
    );

    let insertedAtEnd = true;
    
    try {
      const rootChildren =
        (editor as any)?.children ??
        (editor as any)?.value?.children ??
        (editor as any)?.value;
      if (Array.isArray(rootChildren)) {
        insertedAtEnd = insertAt[0] >= rootChildren.length;
      }
    } catch {
      // ignore
    }

    if (insertedAtEnd) {
      const afterInserted = nextPath(insertAt);
      editor.tf.insertNodes(
        { type: 'p', children: [{ text: '' }] } as any,
        { at: afterInserted, select: true } as any
      );
    } else {
      editor.tf.select(insertAt as any);
    }
  });
}
