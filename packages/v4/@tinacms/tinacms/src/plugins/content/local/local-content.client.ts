// The client segment of the localContentPlugin. It is the ContentSlice from contract.ts,
// and it speaks the wire protocol of content-request.ts over fetch. The content goes from
// the client to the data layer directly, and not through the capability RPC (ADR-018 §1).
//
// It is a transport, and holds no cache. The admin's query client caches these reads.
// Refer to ContentSlice.

import type {
  ContentSlice,
  DocumentEntry,
} from '../../../core/content/contract';
import type { ClientSlice } from '../../../core/plugin';
import type { ContentRequest } from './content-request';

const postContentRequest = async <Result>(
  url: string,
  request: ContentRequest
): Promise<Result> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(
      `Content request ${request.op} failed (${response.status}): ${await response.text()}`
    );
  }
  return response.json();
};

export const createContentSlice = (url: string): ClientSlice => {
  const slice: ContentSlice = {
    list: (collection) =>
      postContentRequest<DocumentEntry[]>(url, { op: 'list', collection }),
    get: (collection, path) =>
      postContentRequest<DocumentEntry | null>(url, {
        op: 'get',
        collection,
        path,
      }),
    // The update returns the stored entry, which can hold more than the value that was
    // sent. The unknown fields of the stored document merge into it.
    update: (collection, path, value) =>
      postContentRequest<DocumentEntry>(url, {
        op: 'update',
        collection,
        path,
        value,
      }),
  };
  // The slice takes no `set`. It writes no state, so it ignores both arguments and
  // returns the same operations at each boot.
  return () => ({ ...slice });
};
