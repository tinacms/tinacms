import { describe, expect, it } from 'vitest';
import {
  type UploadFileState,
  type UploadViewInput,
  uploadViewOf,
} from './upload-view';

const MB = 1024 * 1024;

const file = (
  id: string,
  change: Partial<UploadFileState> = {}
): UploadFileState => ({
  id,
  name: `${id}.jpg`,
  size: 2 * MB,
  folder: 'blog',
  status: 'waiting',
  fraction: null,
  sent: false,
  cancelling: false,
  taken: false,
  ...change,
});

const view = (
  files: UploadFileState[],
  change: Partial<UploadViewInput> = {}
) =>
  uploadViewOf({
    files,
    saving: false,
    progressSeen: true,
    seen: false,
    settling: false,
    mediaOpen: true,
    ...change,
  });

describe('the upload list as data for the Save progress widget', () => {
  it('is empty and idle with no files', () => {
    expect(view([])).toMatchObject({
      files: 0,
      at: 0,
      progress: 0,
      head: '',
      rows: [],
      button: { mode: 'idle' },
      mediaOpen: true,
    });
  });

  it('at the start counts every row, is on file 1 and draws no progress', () => {
    const batch = view([file('a'), file('b'), file('c'), file('d')]);
    expect(batch).toMatchObject({
      files: 4,
      at: 1,
      progress: 0,
      head: 'Uploading 4 files',
      tone: 'run',
      button: { mode: 'run', words: 'Uploading 1 of 4', percent: 0 },
    });
    expect(batch.rows[0]).toMatchObject({
      name: 'a.jpg',
      meta: 'Uploading 0% · 2.0 MB',
      action: 'cancel',
    });
  });

  it('mid-batch counts a stopped row as whole and a silent row as nothing', () => {
    const batch = view([
      file('a', { status: 'done', fraction: 1, savedAs: 'a.jpg' }),
      file('b', { status: 'uploading', fraction: 0.5 }),
      file('c', { status: 'uploading', fraction: null }),
      file('d', { status: 'cancelled' }),
    ]);
    expect(batch).toMatchObject({
      files: 4,
      at: 3,
      progress: 63,
      button: { mode: 'run', words: 'Uploading 3 of 4', percent: 63 },
    });
    expect(batch.rows.map((row) => row.meta)).toEqual([
      'Uploaded to blog',
      'Uploading 50% · 2.0 MB',
      'Uploading · 2.0 MB',
      'Cancelled',
    ]);
  });

  it('never reads 100% while a file uploads, and drops Cancel once its bytes are sent', () => {
    const [row] = view([
      file('a', { status: 'uploading', fraction: 1, sent: true }),
    ]).rows;
    expect(row).toMatchObject({ meta: 'Uploading 99% · 2.0 MB' });
    expect(row?.action).toBeUndefined();
  });

  it('says one file by name, and "Uploading" on the button', () => {
    expect(
      view([file('a', { status: 'uploading', fraction: 0.2 })])
    ).toMatchObject({
      head: 'Uploading a.jpg',
      at: 1,
      button: { mode: 'run', words: 'Uploading' },
    });
  });

  it('reads "Waiting for the save to finish" while a save holds every file', () => {
    const batch = view([file('a'), file('b')], { saving: true });
    expect(batch.head).toBe('Waiting for the save to finish');
    expect(batch.rows[0]?.meta).toBe('Waiting for the save to finish');
  });

  it('after a failure shows the red count until the list was opened', () => {
    const files = [
      file('a', { status: 'done', fraction: 1, savedAs: 'a.jpg' }),
      file('b', {
        status: 'failed',
        reason: 'Something went wrong. Please try again.',
        recovery: 'retry',
      }),
    ];
    expect(view(files)).toMatchObject({
      files: 2,
      at: 2,
      progress: 100,
      head: "1 of 2 files couldn't upload",
      tone: 'fail',
      button: { mode: 'failed', count: 1 },
    });
    expect(view(files).rows[1]).toMatchObject({
      kind: 'fail',
      action: 'retry',
    });
    expect(view(files, { seen: true }).button).toEqual({ mode: 'idle' });
  });

  it('after the end reads "N uploaded" while it settles, with a taken name flagged', () => {
    const files = [
      file('a', { status: 'done', fraction: 1, savedAs: 'a.jpg' }),
      file('b', {
        status: 'done',
        fraction: 1,
        savedAs: 'b-1.jpg',
        taken: true,
      }),
    ];
    const batch = view(files, { settling: true, mediaOpen: false });
    expect(batch).toMatchObject({
      files: 2,
      at: 2,
      progress: 100,
      head: 'Uploaded 2 files',
      tone: 'ok',
      button: { mode: 'done', count: 2 },
      mediaOpen: false,
    });
    expect(batch.rows[1]).toMatchObject({
      name: 'b-1.jpg',
      kind: 'flag',
      meta: 'b.jpg was taken, saved as b-1.jpg',
    });
    expect(view(files).button).toEqual({ mode: 'idle' });
  });
});
