import type { TinaDocument } from '@tinacms/tinacms';

// Playground-local prototype of the visual-editing protocol (#6944 owns the real
// adapter). Only the activate message's shape is doc-pinned — a click carries the
// field address and nothing else (ADR-009 §4). `tina:ready` and `tina:document`
// are playground inventions the real adapter replaces, not inherits.

export const READY_MESSAGE_TYPE = 'tina:ready';
export const DOCUMENT_MESSAGE_TYPE = 'tina:document';
export const ACTIVATE_MESSAGE_TYPE = 'tina:activate';

export interface ReadyMessage {
  type: typeof READY_MESSAGE_TYPE;
}

export interface DocumentMessage {
  type: typeof DOCUMENT_MESSAGE_TYPE;
  values: TinaDocument;
}

export interface ActivateMessage {
  type: typeof ACTIVATE_MESSAGE_TYPE;
  address: string;
}

export const readyMessage = (): ReadyMessage => ({ type: READY_MESSAGE_TYPE });

export const documentMessage = (values: TinaDocument): DocumentMessage => ({
  type: DOCUMENT_MESSAGE_TYPE,
  values,
});

export const activateMessage = (address: string): ActivateMessage => ({
  type: ACTIVATE_MESSAGE_TYPE,
  address,
});

const hasMessageType = (data: unknown, type: string): boolean =>
  typeof data === 'object' &&
  data !== null &&
  (data as { type?: unknown }).type === type;

export const isReadyMessage = (data: unknown): data is ReadyMessage =>
  hasMessageType(data, READY_MESSAGE_TYPE);

export const isDocumentMessage = (data: unknown): data is DocumentMessage =>
  hasMessageType(data, DOCUMENT_MESSAGE_TYPE);

export const isActivateMessage = (data: unknown): data is ActivateMessage =>
  hasMessageType(data, ACTIVATE_MESSAGE_TYPE);
