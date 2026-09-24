import { act, render, screen, waitFor } from '@testing-library/react';
import { EventBus } from '@toolkit/core/event';
import { Form } from '@toolkit/forms';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorialWorkflowOutcome } from './run-editorial-workflow';

const setCurrentBranch = vi.fn();
const events = new EventBus();
const cms = {
  events,
  alerts: { warn: vi.fn() },
  api: { tina: { schema: {}, gitSettingsLink: 'https://app.tina.io/git' } },
};

vi.mock('@toolkit/react-core', () => ({ useCMS: () => cms }));
vi.mock('@toolkit/plugin-branch-switcher', () => ({
  useBranchData: () => ({ setCurrentBranch }),
}));

const runEditorialWorkflow = vi.fn();
vi.mock('./run-editorial-workflow', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  runEditorialWorkflow: (...args: unknown[]) => runEditorialWorkflow(...args),
}));

import {
  EditorialWorkflowProvider,
  useEditorialWorkflowState,
} from './editorial-workflow-provider';

let context: ReturnType<typeof useEditorialWorkflowState>;
const Probe = () => {
  context = useEditorialWorkflowState();
  return null;
};

const renderProvider = () =>
  render(
    <EditorialWorkflowProvider>
      <Probe />
    </EditorialWorkflowProvider>
  );

const deferred = () => {
  let resolve!: (outcome: EditorialWorkflowOutcome) => void;
  const promise = new Promise<EditorialWorkflowOutcome>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const startedRun = () => {
  const run = deferred();
  runEditorialWorkflow.mockImplementation((_cms, opts) => {
    opts.onStart();
    return run.promise;
  });
  return run;
};

const makeForm = ({ onScreen = true } = {}) => {
  const form = new Form({
    id: 'posts/hello.md',
    label: 'Hello',
    onSubmit: vi.fn(),
    fields: [],
    initialValues: { title: 'Hello', body: 'First' },
  });
  if (onScreen) {
    form.finalForm.registerField('title', () => {}, {});
    form.finalForm.registerField('body', () => {}, {});
  }
  return form;
};

const succeeded: EditorialWorkflowOutcome = {
  status: 'succeeded',
  branchName: 'tina/hello-updates',
  pullRequestUrl: 'https://github.com/org/repo/pull/1',
};

describe('EditorialWorkflowProvider', () => {
  beforeEach(() => {
    runEditorialWorkflow.mockReset();
    setCurrentBranch.mockReset();
  });

  it('runs a content save through to success and switches branch', async () => {
    const run = startedRun();
    renderProvider();

    let result: Awaited<ReturnType<typeof context.startContentSave>>;
    await act(async () => {
      result = await context.startContentSave({
        branchName: 'tina/hello-updates',
        baseBranch: 'main',
        path: 'content/posts/hello.md',
        values: {},
        crudType: 'update',
      });
    });

    expect(result.started).toBe(true);
    expect(context.isExecuting).toBe(true);
    expect(context.state).toMatchObject({ phase: 'running', step: 1 });

    await act(async () => run.resolve(succeeded));

    expect(context.state).toMatchObject({
      phase: 'success',
      pullRequestUrl: succeeded.pullRequestUrl,
    });
    expect(setCurrentBranch).toHaveBeenCalledWith('tina/hello-updates');
  });

  it('rejects a second save while one is running', async () => {
    startedRun();
    renderProvider();
    const opts = {
      branchName: 'tina/a',
      baseBranch: 'main',
      path: 'content/posts/hello.md',
      values: {},
      crudType: 'update',
    };

    await act(async () => {
      await context.startContentSave(opts);
    });
    const second = await context.startContentSave(opts);

    expect(second.started).toBe(false);
    expect(runEditorialWorkflow).toHaveBeenCalledTimes(1);
  });

  it('returns pre-flight failures to the caller without starting', async () => {
    runEditorialWorkflow.mockResolvedValue({
      status: 'failed',
      started: false,
      error: { messageParts: [{ text: 'Branch exists' }] },
    });
    renderProvider();

    const result = await context.startContentSave({
      branchName: 'tina/a',
      baseBranch: 'main',
      path: 'content/posts/hello.md',
      values: {},
      crudType: 'update',
    });

    expect(result).toEqual({
      started: false,
      error: { messageParts: [{ text: 'Branch exists' }] },
    });
    expect(context.state.phase).toBe('idle');
  });

  it('shows failures after the save started in the widget', async () => {
    const run = startedRun();
    renderProvider();

    await act(async () => {
      await context.startContentSave({
        branchName: 'tina/a',
        baseBranch: 'main',
        path: 'content/posts/hello.md',
        values: {},
        crudType: 'update',
      });
    });
    await act(async () =>
      run.resolve({
        status: 'failed',
        started: true,
        error: { messageParts: [{ text: 'Indexing failed' }] },
      })
    );

    expect(context.state.phase).toBe('error');
    expect(context.isExecuting).toBe(false);
    expect(screen.getByText('Indexing failed')).toBeTruthy();
  });

  it('marks the saved values clean and keeps edits made during the save', async () => {
    const run = startedRun();
    const form = makeForm();
    renderProvider();

    form.change('title', 'Saved title');
    await act(async () => {
      await context.startContentSave({
        branchName: 'tina/a',
        baseBranch: 'main',
        path: 'content/posts/hello.md',
        values: form.values,
        crudType: 'update',
        tinaForm: form,
      });
    });
    form.change('body', 'Typed during the save');
    await act(async () => run.resolve(succeeded));

    expect(form.values).toEqual({
      title: 'Saved title',
      body: 'Typed during the save',
    });
    expect(form.finalForm.getState().initialValues.title).toBe('Saved title');
    expect(form.dirty).toBe(true);
    expect(context.state).toMatchObject({
      phase: 'success',
      hasNewEdits: true,
    });
  });

  it('keeps edits in a form that is no longer on screen', async () => {
    const run = startedRun();
    const form = makeForm({ onScreen: false });
    renderProvider();

    await act(async () => {
      await context.startContentSave({
        branchName: 'tina/a',
        baseBranch: 'main',
        path: 'content/posts/hello.md',
        values: form.values,
        crudType: 'update',
        tinaForm: form,
      });
    });
    form.change('body', 'Typed during the save');
    await act(async () => run.resolve(succeeded));

    expect(form.values.body).toBe('Typed during the save');
    expect(context.state).toMatchObject({
      phase: 'success',
      hasNewEdits: true,
    });
  });

  it('leaves the form clean when nothing changed during the save', async () => {
    const run = startedRun();
    const form = makeForm();
    renderProvider();

    form.change('title', 'Saved title');
    await act(async () => {
      await context.startContentSave({
        branchName: 'tina/a',
        baseBranch: 'main',
        path: 'content/posts/hello.md',
        values: form.values,
        crudType: 'update',
        tinaForm: form,
      });
    });
    await act(async () => run.resolve(succeeded));

    expect(form.dirty).toBe(false);
    expect(context.state).toMatchObject({
      phase: 'success',
      hasNewEdits: false,
    });
  });

  it('follows media workflow events', async () => {
    renderProvider();

    act(() => {
      events.dispatch({ type: 'media:workflow:start', branchName: 'tina/m' });
    });
    expect(context.state).toMatchObject({ phase: 'running', step: 1 });

    act(() => {
      events.dispatch({ type: 'media:workflow:step', step: 2 });
    });
    expect(context.state).toMatchObject({ phase: 'running', step: 2 });

    act(() => {
      events.dispatch({
        type: 'media:workflow:complete',
        branchName: 'tina/m',
      });
      events.dispatch({ type: 'media:workflow:finish' });
    });
    expect(context.state).toMatchObject({
      phase: 'success',
      branchName: 'tina/m',
    });
    expect(setCurrentBranch).toHaveBeenCalledWith('tina/m');
  });

  it('warns before unload only while a save runs', async () => {
    const run = startedRun();
    renderProvider();
    const unloadBlocked = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(unloadBlocked()).toBe(false);
    await act(async () => {
      await context.startContentSave({
        branchName: 'tina/a',
        baseBranch: 'main',
        path: 'content/posts/hello.md',
        values: {},
        crudType: 'update',
      });
    });
    expect(unloadBlocked()).toBe(true);

    await act(async () => run.resolve(succeeded));
    await waitFor(() => expect(unloadBlocked()).toBe(false));
  });
});
