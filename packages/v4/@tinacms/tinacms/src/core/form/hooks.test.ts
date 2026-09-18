import { describe, expect, it, vi } from 'vitest';
import { toFormId } from '../../form/form-store';
import { toFieldAddress } from '../field/address';
import { type ResolvedSegment, definePlugin } from '../plugin';
import type { TinaDocument } from '../schema/types';
import {
  type FormHooks,
  createFormHookRegistry,
  runAfterEdit,
  runAfterSave,
  runBeforeSave,
} from './hooks';

const scope = {
  formId: toFormId('content/posts/a.mdx'),
  path: 'content/posts/a.mdx',
  collection: { name: 'post', format: 'mdx' as const, fields: [] },
};

const resolved = (
  name: string,
  hooks: FormHooks | undefined,
  provides: ('hooks' | 'field')[] = ['hooks']
): ResolvedSegment => ({
  manifest: definePlugin({ name, provides }),
  segment: hooks ? { hooks } : {},
});

const tag =
  (label: string): FormHooks['beforeSave'] =>
  (document) => ({
    ...document,
    trail: `${String(document.trail ?? '')}${label}`,
  });

describe('createFormHookRegistry', () => {
  it('keeps plugin order and skips segments without hooks', () => {
    const a: FormHooks = { beforeSave: tag('a') };
    const b: FormHooks = { beforeSave: tag('b') };
    const registry = createFormHookRegistry([
      resolved('a', a),
      resolved('none', undefined, ['field']),
      resolved('b', b),
    ]);
    expect(registry).toEqual([a, b]);
  });

  it('throws when a segment has hooks but the manifest does not provide "hooks"', () => {
    expect(() =>
      createFormHookRegistry([
        resolved('quiet', { afterSave: () => {} }, ['field']),
      ])
    ).toThrow(/provides: \["hooks"\]/);
  });
});

describe('runBeforeSave', () => {
  it('threads the document through each hook in order', async () => {
    const out = await runBeforeSave(
      [{ beforeSave: tag('a') }, {}, { beforeSave: tag('b') }],
      { title: 'x' },
      scope
    );
    expect(out).toEqual({ title: 'x', trail: 'ab' });
  });

  it('awaits async hooks', async () => {
    const out = await runBeforeSave(
      [{ beforeSave: async (document) => ({ ...document, seen: true }) }],
      { title: 'x' },
      scope
    );
    expect(out).toEqual({ title: 'x', seen: true });
  });

  it('stops at the first throwing hook', async () => {
    const later = vi.fn<NonNullable<FormHooks['beforeSave']>>((d) => d);
    await expect(
      runBeforeSave(
        [
          {
            beforeSave: () => {
              throw new Error('veto');
            },
          },
          { beforeSave: later },
        ],
        { title: 'x' },
        scope
      )
    ).rejects.toThrow('veto');
    expect(later).not.toHaveBeenCalled();
  });

  it('returns the input untouched when no hook defines beforeSave', async () => {
    const document: TinaDocument = { title: 'x' };
    expect(
      await runBeforeSave([{}, { afterSave: () => {} }], document, scope)
    ).toBe(document);
  });
});

describe('runAfterSave', () => {
  it('calls each hook in order with the same document', async () => {
    const calls: string[] = [];
    await runAfterSave(
      [
        {
          afterSave: () => {
            calls.push('a');
          },
        },
        {
          afterSave: async () => {
            calls.push('b');
          },
        },
      ],
      { title: 'x' },
      scope
    );
    expect(calls).toEqual(['a', 'b']);
  });
});

describe('runAfterEdit', () => {
  it('calls each hook synchronously with the edit and scope', () => {
    const seen = vi.fn();
    const edit = { address: toFieldAddress('title'), value: 'x' };
    runAfterEdit([{ afterEdit: seen }, {}], edit, scope);
    expect(seen).toHaveBeenCalledWith(edit, scope);
  });

  it('logs a throwing hook and still calls the next one', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const later = vi.fn();
    const edit = { address: toFieldAddress('title'), value: 'x' };
    runAfterEdit(
      [
        {
          afterEdit: () => {
            throw new Error('observer broke');
          },
        },
        { afterEdit: later },
      ],
      edit,
      scope
    );
    expect(later).toHaveBeenCalledWith(edit, scope);
    expect(error).toHaveBeenCalledWith(
      '[tinacms] afterEdit hook failed:',
      expect.objectContaining({ message: 'observer broke' })
    );
    error.mockRestore();
  });
});
