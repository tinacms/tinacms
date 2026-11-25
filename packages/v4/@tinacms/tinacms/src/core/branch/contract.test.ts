import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { ContentProvider } from '../content/contract';
import { createTinaStore } from '../../store/create-store';
import { AuthError } from '../auth/contract';
import { createBranchAction } from './create';
import { BranchCreateError, branchSliceOf } from './contract';

const sliceWith = (saveToNewBranch: unknown) =>
  branchSliceOf({
    branch: { list: [], protected: [], switchTo: () => {}, saveToNewBranch },
  });

describe('BranchSource', () => {
  it('needs only list and defaultBranch', () => {
    const branches = {
      list: async () => [],
      defaultBranch: async () => 'main',
    };
    expectTypeOf(branches).toExtend<NonNullable<ContentProvider['branches']>>();
  });
});

describe('branchSliceOf create fields', () => {
  it('leaves create and creating undefined for a provider that cannot create', () => {
    const slice = branchSliceOf({
      branch: { list: [], protected: [], switchTo: () => {} },
    });
    expect(slice?.create).toBeUndefined();
    expect(slice?.creating).toBeUndefined();
    expect(slice?.createResult).toBeUndefined();
  });

  it('keeps a well-formed creating record and drops a malformed one', () => {
    const base = { list: [], protected: [], switchTo: () => {} };
    const creating = {
      name: 'cms/x',
      from: 'main',
      startedOn: undefined,
      phase: 'making',
    };
    expect(branchSliceOf({ branch: { ...base, creating } })?.creating).toEqual(
      creating
    );
    expect(
      branchSliceOf({
        branch: { ...base, creating: { ...creating, phase: 'x' } },
      })?.creating
    ).toBeUndefined();
  });
});

describe('branchSliceOf createResult', () => {
  it('keeps the branch the create started on', () => {
    const base = { list: [], protected: [], switchTo: () => {} };
    const createResult = {
      name: 'cms/x',
      from: 'main',
      startedOn: 'docs',
      outcome: 'ready',
    };
    expect(
      branchSliceOf({ branch: { ...base, createResult } })?.createResult
    ).toEqual(createResult);
  });
});

describe('branchSliceOf', () => {
  it('passes saveToNewBranch through when it is a function', async () => {
    const action = vi.fn().mockResolvedValue({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    const request = {
      name: 'docs/hello-edits',
      from: 'main',
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Hello' },
    };
    await expect(
      sliceWith(action)?.saveToNewBranch?.(request)
    ).resolves.toEqual({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    expect(action).toHaveBeenCalledWith(request);
  });

  it.each([undefined, 'create', { name: 'x' }])(
    'leaves saveToNewBranch undefined for %o',
    (value) => {
      const slice = sliceWith(value);
      expect(slice).toBeDefined();
      expect(slice?.saveToNewBranch).toBeUndefined();
    }
  );
});

describe('createBranchAction', () => {
  it.each([
    [new BranchCreateError('no answer', 'timeout'), 'timeout'],
    [new BranchCreateError('taken', 'exists'), 'exists'],
    [new AuthError('expired'), 'auth'],
    [new Error('boom'), 'other'],
  ])('records why a create failed: %s', async (cause, failure) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createTinaStore([]);
    store.setState({
      branch: { list: ['main'], protected: [], switchTo: () => {} },
    } as never);
    createBranchAction(store, {
      list: async () => [],
      defaultBranch: async () => 'main',
      create: () => Promise.reject(cause),
    })('cms/one', 'main');
    await vi.waitFor(() =>
      expect(branchSliceOf(store.getState())?.createResult).toMatchObject({
        outcome: 'failed',
      })
    );
    expect(branchSliceOf(store.getState())?.createResult?.failure).toBe(
      failure
    );
    warn.mockRestore();
  });

  it('records a failure and accepts a later create when the provider throws synchronously', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createTinaStore([]);
    store.setState({
      branch: { list: ['main'], protected: [], switchTo: () => {} },
    } as never);
    const create = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('boom');
      })
      .mockResolvedValueOnce({ name: 'cms/two' });
    const act = createBranchAction(store, {
      list: async () => [],
      defaultBranch: async () => 'main',
      create,
    });

    act('cms/one', 'main');
    await vi.waitFor(() =>
      expect(branchSliceOf(store.getState())?.createResult).toMatchObject({
        name: 'cms/one',
        outcome: 'failed',
      })
    );
    expect(branchSliceOf(store.getState())?.creating).toBeUndefined();

    act('cms/two', 'main');
    await vi.waitFor(() =>
      expect(branchSliceOf(store.getState())?.createResult).toMatchObject({
        name: 'cms/two',
        outcome: 'ready',
      })
    );
    expect(create).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  const brokenReady = {
    'a ready getter that throws': () => ({
      name: 'cms/one',
      get ready(): Promise<void> {
        throw new Error('getter');
      },
    }),
    'a ready that is not a promise': () => ({
      name: 'cms/one',
      ready: true as unknown as Promise<void>,
    }),
    'a ready whose then throws': () => ({
      name: 'cms/one',
      ready: {
        then: () => {
          throw new Error('then');
        },
      } as unknown as Promise<void>,
    }),
  };

  const unusable = {
    'create resolving to undefined': () => undefined,
    'create resolving to a non-object': () => 42,
    'create resolving to a non-string name': () => ({ name: 5 }),
    'create resolving to an empty name': () => ({ name: '' }),
    'create resolving to a name getter that throws': () => ({
      get name(): string {
        throw new Error('name');
      },
    }),
  };

  const run = async (result: () => unknown) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    const store = createTinaStore([]);
    store.setState({
      branch: { list: ['main'], protected: [], switchTo: () => {} },
    } as never);
    const create = vi
      .fn()
      .mockImplementationOnce(async () => result())
      .mockResolvedValueOnce({ name: 'cms/two' });
    const start = createBranchAction(store, {
      list: async () => [],
      defaultBranch: async () => 'main',
      create: create as never,
    });
    start('cms/one', 'main');
    await vi.waitFor(() =>
      expect(branchSliceOf(store.getState())?.createResult).toBeDefined()
    );
    const slice = branchSliceOf(store.getState());
    start('cms/two', 'main');
    await vi.waitFor(() =>
      expect(branchSliceOf(store.getState())?.createResult?.name).toBe(
        'cms/two'
      )
    );
    await new Promise((r) => setTimeout(r, 0));
    process.off('unhandledRejection', unhandled);
    warn.mockRestore();
    return { slice, unhandled, create };
  };

  it.each(Object.entries(brokenReady))(
    'ends unready, keeps the branch and accepts a later create for %s',
    async (_label, result) => {
      const { slice, unhandled, create } = await run(result);
      expect(slice?.createResult).toMatchObject({
        name: 'cms/one',
        outcome: 'unready',
      });
      expect(slice?.creating).toBeUndefined();
      expect(slice?.list).toContain('cms/one');
      expect(create).toHaveBeenCalledTimes(2);
      expect(unhandled).not.toHaveBeenCalled();
    }
  );

  it.each(Object.entries(unusable))(
    'ends failed for the requested name and accepts a later create for %s',
    async (_label, result) => {
      const { slice, unhandled, create } = await run(result);
      expect(slice?.createResult).toMatchObject({
        name: 'cms/one',
        outcome: 'failed',
      });
      expect(slice?.creating).toBeUndefined();
      expect(create).toHaveBeenCalledTimes(2);
      expect(unhandled).not.toHaveBeenCalled();
    }
  );

  it('keeps the first outcome when a ready thenable fulfils and then throws', async () => {
    const { slice } = await run(() => ({
      name: 'cms/one',
      ready: {
        then: (fulfil: () => void) => {
          fulfil();
          throw new Error('late');
        },
      } as unknown as Promise<void>,
    }));
    expect(slice?.createResult).toMatchObject({
      name: 'cms/one',
      outcome: 'ready',
    });
  });

  it('still ends unready when ready rejects and ready when it resolves', async () => {
    const rejected = await run(() => ({
      name: 'cms/one',
      ready: Promise.reject(new Error('no')),
    }));
    expect(rejected.slice?.createResult?.outcome).toBe('unready');
    const fine = await run(() => ({
      name: 'cms/one',
      ready: Promise.resolve(),
    }));
    expect(fine.slice?.createResult?.outcome).toBe('ready');
    expect(fine.slice?.unready).toEqual([]);
  });

  it('keeps an unready branch listed once in unready after creating clears and a second create finishes', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createTinaStore([]);
    store.setState({
      branch: { list: ['main'], protected: [], switchTo: () => {} },
    } as never);
    const create = vi
      .fn()
      .mockImplementationOnce(async () => ({
        name: 'cms/one',
        ready: Promise.reject(new Error('no')),
      }))
      .mockImplementationOnce(async () => ({
        name: 'cms/one',
        ready: Promise.reject(new Error('no')),
      }))
      .mockResolvedValueOnce({ name: 'cms/two' });
    const start = createBranchAction(store, {
      list: async () => [],
      defaultBranch: async () => 'main',
      create,
    });
    const settled = async (name: string) => {
      await vi.waitFor(() => {
        const slice = branchSliceOf(store.getState());
        expect(slice?.createResult?.name).toBe(name);
        expect(slice?.creating).toBeUndefined();
      });
    };
    start('cms/one', 'main');
    await settled('cms/one');
    expect(branchSliceOf(store.getState())?.unready).toEqual(['cms/one']);
    start('cms/one', 'main');
    await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    await vi.waitFor(() =>
      expect(branchSliceOf(store.getState())?.creating).toBeUndefined()
    );
    start('cms/two', 'main');
    await settled('cms/two');
    expect(branchSliceOf(store.getState())).toMatchObject({
      unready: ['cms/one'],
      createResult: { outcome: 'ready' },
    });
    const reloaded = createTinaStore([]);
    reloaded.setState({
      branch: { list: ['main'], protected: [], switchTo: () => {} },
    } as never);
    expect(branchSliceOf(reloaded.getState())?.unready).toEqual([]);
    warn.mockRestore();
  });
});
