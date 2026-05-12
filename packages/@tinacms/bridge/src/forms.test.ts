import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataStore } from './types';

function fakeStore(): DataStore {
  const data = new Map<string, object>();
  return {
    get: (id) => data.get(id),
    seed: (id, d) => {
      data.set(id, d);
    },
    set: (id, d) => {
      data.set(id, d);
    },
    ids: () => [...data.keys()],
    subscribe: () => () => {},
  };
}

function formDiv(
  payload: { id: string; query: string },
  primary = false
): string {
  const json = JSON.stringify({ variables: {}, data: {}, ...payload });
  return `<div data-tina-form='${json}'${primary ? ' data-tina-primary' : ''} hidden></div>`;
}

describe('forms — primary form selection', () => {
  let posted: { 0: { type: string; [k: string]: unknown } }[];
  let originalPostMessage: typeof window.parent.postMessage;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    document.body.innerHTML = '';
    posted = [];
    originalPostMessage = window.parent.postMessage;
    window.parent.postMessage = ((msg: { type: string }) => {
      posted.push({ 0: msg });
    }) as typeof window.parent.postMessage;
  });

  afterEach(() => {
    window.parent.postMessage = originalPostMessage;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const types = () => posted.map((c) => c[0].type);

  it('posts user-select-form for the data-tina-primary form', async () => {
    document.body.innerHTML =
      formDiv({ id: 'g', query: 'query Global' }) +
      formDiv({ id: 'p', query: 'query Post' }, true);

    const { initForms } = await import('./forms');
    initForms(fakeStore());

    expect(types()).toContain('open');
    const select = posted.find((c) => c[0].type === 'user-select-form');
    expect(select).toBeTruthy();
    expect(select![0].formId).toBe('p');
  });

  it('does not post user-select-form when nothing is marked primary', async () => {
    document.body.innerHTML =
      formDiv({ id: 'a', query: 'query A' }) +
      formDiv({ id: 'b', query: 'query B' });

    const { initForms } = await import('./forms');
    initForms(fakeStore());

    expect(types()).toContain('open');
    expect(types()).not.toContain('user-select-form');
  });
});
