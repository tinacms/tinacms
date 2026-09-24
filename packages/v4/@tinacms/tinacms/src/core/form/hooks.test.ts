import { describe, expect, it, vi } from 'vitest';
import { toFormId } from '../../form/form-store';
import { toFieldAddress } from '../field/address';
import {
  type CapabilityOverride,
  type ResolvedSegment,
  definePlugin,
  resolveClientSegments,
} from '../plugin';
import type { TinaDocument } from '../schema/types';
import {
  type FormHookFactory,
  type FormHooks,
  createFormHookRegistry,
  defineHook,
  defineHooksPlugin,
  resolveFormHooks,
  runAfterSave,
  runBeforeSave,
  runOnChange,
} from './hooks';

const scope = {
  formId: toFormId('content/posts/a.mdx'),
  path: 'content/posts/a.mdx',
  collection: { name: 'post', format: 'mdx' as const, fields: [] },
};

const stamp: FormHookFactory = (label) => ({
  beforeSave: (document) => ({
    ...document,
    trail: `${String(document.trail ?? '')}${String(label)}`,
  }),
});

const resolved = (
  spec: { name: string; hooks?: string[]; overrides?: CapabilityOverride[] },
  factories?: Record<string, FormHookFactory>
): ResolvedSegment => ({
  manifest: definePlugin({
    name: spec.name,
    provides: ['hooks'],
    hooks: spec.hooks,
    overrides: spec.overrides,
  }),
  segment: { hooks: factories },
});

describe('createFormHookRegistry', () => {
  it('registers each factory under the name its manifest declares', () => {
    const registry = createFormHookRegistry([
      resolved({ name: 'a', hooks: ['stamp'] }, { stamp }),
    ]);
    expect(registry.get('stamp')).toBe(stamp);
  });

  it('skips a plugin that declares no hooks', () => {
    expect(createFormHookRegistry([resolved({ name: 'quiet' })]).size).toBe(0);
  });

  it('rejects a declared name with no factory', () => {
    expect(() =>
      createFormHookRegistry([resolved({ name: 'a', hooks: ['stamp'] }, {})])
    ).toThrow(/no factory for "stamp"/);
  });

  it('rejects a factory the manifest does not declare', () => {
    expect(() =>
      createFormHookRegistry([resolved({ name: 'a' }, { stamp })])
    ).toThrow(/does not declare "stamp"/);
  });

  it('rejects two plugins that register the same name', () => {
    expect(() =>
      createFormHookRegistry([
        resolved({ name: 'a', hooks: ['stamp'] }, { stamp }),
        resolved({ name: 'b', hooks: ['stamp'] }, { stamp }),
      ])
    ).toThrow(/both register the form hook "stamp"/);
  });

  it('lets an override replace a name', () => {
    const replacement: FormHookFactory = () => ({});
    const registry = createFormHookRegistry([
      resolved({ name: 'a', hooks: ['stamp'] }, { stamp }),
      resolved(
        {
          name: 'b',
          hooks: ['stamp'],
          overrides: [{ capability: 'hooks', key: 'stamp' }],
        },
        { stamp: replacement }
      ),
    ]);
    expect(registry.get('stamp')).toBe(replacement);
  });
});

describe('resolveFormHooks', () => {
  const registry = createFormHookRegistry([
    resolved({ name: 'a', hooks: ['stamp'] }, { stamp }),
  ]);

  it('builds hooks from refs in ref order, passing args to the factory', async () => {
    const hooks = resolveFormHooks(registry, [
      { name: 'stamp', args: ['b'] },
      { name: 'stamp', args: ['a'] },
    ]);
    expect(await runBeforeSave(hooks, { title: 'x' }, scope)).toEqual({
      title: 'x',
      trail: 'ba',
    });
  });

  it('returns no hooks for no refs', () => {
    expect(resolveFormHooks(registry, [])).toEqual([]);
  });

  it('rejects a name no plugin registers', () => {
    expect(() => resolveFormHooks(registry, [{ name: 'missing' }])).toThrow(
      /form hook "missing"/
    );
  });
});

describe('runBeforeSave', () => {
  it('awaits async hooks and threads the document', async () => {
    const out = await runBeforeSave(
      [
        { beforeSave: async (document) => ({ ...document, seen: true }) },
        {},
        stamp('z'),
      ],
      { title: 'x' },
      scope
    );
    expect(out).toEqual({ title: 'x', seen: true, trail: 'z' });
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

  it('runs every hook, then rethrows the first failure and logs the rest', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const later = vi.fn();
    await expect(
      runAfterSave(
        [
          {
            afterSave: () => {
              throw new Error('first');
            },
          },
          { afterSave: later },
          {
            afterSave: () => {
              throw new Error('second');
            },
          },
        ],
        { title: 'x' },
        scope
      )
    ).rejects.toThrow('first');
    expect(later).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      '[tinacms] afterSave hook failed:',
      expect.objectContaining({ message: 'second' })
    );
    error.mockRestore();
  });
});

describe('runOnChange', () => {
  it('calls each hook synchronously with the edit and scope', () => {
    const seen = vi.fn();
    const edit = { address: toFieldAddress('title'), value: 'x' };
    runOnChange([{ onChange: seen }, {}], edit, scope);
    expect(seen).toHaveBeenCalledWith(edit, scope);
  });

  it('logs a throwing hook and still calls the next one', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const later = vi.fn();
    const edit = { address: toFieldAddress('title'), value: 'x' };
    runOnChange(
      [
        {
          onChange: () => {
            throw new Error('observer broke');
          },
        },
        { onChange: later },
      ],
      edit,
      scope
    );
    expect(later).toHaveBeenCalledWith(edit, scope);
    expect(error).toHaveBeenCalledWith(
      '[tinacms] onChange hook failed:',
      expect.objectContaining({ message: 'observer broke' })
    );
    error.mockRestore();
  });
});

describe('defineHook', () => {
  const logSave = defineHook('logSave', (prefix: string) => ({
    afterSave: (_document, { path }) => {
      console.info(`${prefix} ${path}`);
    },
  }));
  const requireStars = defineHook('requireStars', () => ({}));

  it('returns a ref helper that carries the name and args', () => {
    expect(logSave('saved')).toEqual({ name: 'logSave', args: ['saved'] });
  });

  it('omits args when the hook takes none', () => {
    expect(requireStars()).toEqual({ name: 'requireStars' });
  });

  it('exposes the name and the factory for the registry', () => {
    expect(logSave.hookName).toBe('logSave');
    expect(logSave.factory('x')).toHaveProperty('afterSave');
  });

  it('types the args', () => {
    // @ts-expect-error a number is not a string
    logSave(1);
  });
});

describe('defineHooksPlugin', () => {
  const stampHook = defineHook('stamp', (label: string) => ({
    beforeSave: (document) => ({
      ...document,
      trail: `${String(document.trail ?? '')}${label}`,
    }),
  }));
  const plugin = defineHooksPlugin('test:hooks', [stampHook]);

  it('declares the hook names on the manifest', () => {
    expect(plugin.name).toBe('test:hooks');
    expect(plugin.provides).toEqual(['hooks']);
    expect(plugin.hooks).toEqual(['stamp']);
  });

  it('ships the factories in its client segment', async () => {
    const registry = createFormHookRegistry(
      await resolveClientSegments([plugin])
    );
    const hooks = resolveFormHooks(registry, [stampHook('a'), stampHook('b')]);
    expect(await runBeforeSave(hooks, { title: 'x' }, scope)).toEqual({
      title: 'x',
      trail: 'ab',
    });
  });
});
