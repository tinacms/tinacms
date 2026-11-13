import type { TinaDocument } from '../core/schema/types';

export const READY_MESSAGE_TYPE = 'tina:ready';
export const DOCUMENTS_MESSAGE_TYPE = 'tina:documents';
export const VALUES_MESSAGE_TYPE = 'tina:values';
export const ACTIVATE_MESSAGE_TYPE = 'tina:activate';
export const OUTLINE_MESSAGE_TYPE = 'tina:outline';

export const TINA_FIELD_ATTR = 'data-tina-field';
export const TINA_DOCUMENT_ATTR = 'data-tina-document';

/** A document the page draws, named by its repo-relative path. `shared`: drawn on many pages (nav, footer). */
export interface DeclaredDocument {
  path: string;
  shared?: boolean;
}

export interface Mark {
  address: string;
  document?: string;
}

export interface ReadyMessage {
  type: typeof READY_MESSAGE_TYPE;
  documents?: DeclaredDocument[];
  url?: string;
}

export interface DocumentsMessage {
  type: typeof DOCUMENTS_MESSAGE_TYPE;
  documents: DeclaredDocument[];
  url?: string;
}

export interface ActivateMessage {
  type: typeof ACTIVATE_MESSAGE_TYPE;
  address: string;
  document?: string;
}

export interface ValuesMessage {
  type: typeof VALUES_MESSAGE_TYPE;
  values: TinaDocument;
  document?: string;
}

export interface OutlineMessage {
  type: typeof OUTLINE_MESSAGE_TYPE;
  hovered: Mark | null;
  active: (Mark & { name: string }) | null;
}

export const readyMessage = (
  documents?: DeclaredDocument[],
  url?: string
): ReadyMessage => ({
  type: READY_MESSAGE_TYPE,
  ...(documents && { documents }),
  ...(url !== undefined && { url }),
});

export const documentsMessage = (
  documents: DeclaredDocument[],
  url?: string
): DocumentsMessage => ({
  type: DOCUMENTS_MESSAGE_TYPE,
  documents,
  ...(url !== undefined && { url }),
});

export const activateMessage = (
  address: string,
  document?: string
): ActivateMessage => ({
  type: ACTIVATE_MESSAGE_TYPE,
  address,
  ...(document !== undefined && { document }),
});

export const valuesMessage = (
  values: TinaDocument,
  document?: string
): ValuesMessage => ({
  type: VALUES_MESSAGE_TYPE,
  values,
  ...(document !== undefined && { document }),
});

export const outlineMessage = (
  hovered: Mark | null,
  active: (Mark & { name: string }) | null
): OutlineMessage => ({ type: OUTLINE_MESSAGE_TYPE, hovered, active });

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null;

const hasMessageType = (
  data: unknown,
  type: string
): data is Record<string, unknown> => isRecord(data) && data.type === type;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

const isDeclaredDocument = (value: unknown): boolean =>
  isRecord(value) &&
  isNonEmptyString(value.path) &&
  (value.shared === undefined || typeof value.shared === 'boolean');

const isDeclaredDocuments = (value: unknown): boolean =>
  Array.isArray(value) && value.every(isDeclaredDocument);

const isMark = (value: unknown): boolean =>
  isRecord(value) &&
  isNonEmptyString(value.address) &&
  isOptionalString(value.document);

export const isReadyMessage = (data: unknown): data is ReadyMessage =>
  hasMessageType(data, READY_MESSAGE_TYPE) &&
  (data.documents === undefined || isDeclaredDocuments(data.documents)) &&
  isOptionalString(data.url);

export const isDocumentsMessage = (data: unknown): data is DocumentsMessage =>
  hasMessageType(data, DOCUMENTS_MESSAGE_TYPE) &&
  isDeclaredDocuments(data.documents) &&
  isOptionalString(data.url);

export const isValuesMessage = (data: unknown): data is ValuesMessage =>
  hasMessageType(data, VALUES_MESSAGE_TYPE) &&
  isRecord(data.values) &&
  isOptionalString(data.document);

export const isActivateMessage = (data: unknown): data is ActivateMessage =>
  hasMessageType(data, ACTIVATE_MESSAGE_TYPE) &&
  isNonEmptyString(data.address) &&
  isOptionalString(data.document);

export const isOutlineMessage = (data: unknown): data is OutlineMessage =>
  hasMessageType(data, OUTLINE_MESSAGE_TYPE) &&
  (data.hovered === null || isMark(data.hovered)) &&
  (data.active === null ||
    (isRecord(data.active) &&
      isMark(data.active) &&
      typeof data.active.name === 'string'));

/** Spreadable marker attributes; `document` names the document the field belongs to (path). */
export const tinaField = (
  address: string,
  document?: string
): { 'data-tina-field': string; 'data-tina-document'?: string } => ({
  [TINA_FIELD_ATTR]: address,
  ...(document !== undefined && { [TINA_DOCUMENT_ATTR]: document }),
});
