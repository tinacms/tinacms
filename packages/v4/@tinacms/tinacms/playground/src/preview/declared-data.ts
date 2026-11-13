import type { TinaDocument } from '@tinacms/tinacms';
import { isRecord } from '../../../src/utils/is-record';

const CONTENT_URL = '/api/tina/content';

const COLLECTION_FOLDERS = [
  ['content/posts/', 'post'],
  ['content/authors/', 'author'],
  ['content/global/', 'global'],
] as const;

export const GLOBAL_DOCUMENT = 'content/global/site.json';

/** Reads one document through the local data layer, the same RPC the admin uses. */
export async function readDocument(path: string): Promise<TinaDocument> {
  const folder = COLLECTION_FOLDERS.find(([prefix]) => path.startsWith(prefix));
  if (!folder) throw new Error(`No collection owns ${path}`);
  const response = await fetch(CONTENT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ op: 'get', collection: folder[1], path }),
  });
  if (!response.ok) throw new Error(`Reading ${path} failed`);
  const entry: unknown = await response.json();
  if (!isRecord(entry) || !isRecord(entry.document)) {
    throw new Error(`${path} does not exist`);
  }
  return entry.document;
}

/** A post with its referenced author read in, as the admin streams it. */
export async function readPost(path: string): Promise<TinaDocument> {
  const post = await readDocument(path);
  const authorPath = post.author;
  if (typeof authorPath !== 'string') return post;
  return { ...post, author: await readDocument(authorPath) };
}

export const textOf = (value: unknown): string =>
  typeof value === 'string' ? value : '';

export const recordsOf = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];
