import type { TinaDocument } from '../core/schema/types';

// The visual-editing wire protocol (the v4 slice of #6944): three messages across
// the editor/preview window boundary. `tina:activate` is doc-pinned — a click
// carries the field address and nothing else (ADR-009 §4). `tina:ready` (preview →
// editor handshake) and `tina:values` (editor → preview full-state stream) are this
// package's own contract; both halves ship in lockstep from here, so there is no
// version or formId envelope — growth is a new message type.

export const READY_MESSAGE_TYPE = 'tina:ready';
export const VALUES_MESSAGE_TYPE = 'tina:values';
export const ACTIVATE_MESSAGE_TYPE = 'tina:activate';

export interface ReadyMessage {
  type: typeof READY_MESSAGE_TYPE;
}

export interface ValuesMessage {
  type: typeof VALUES_MESSAGE_TYPE;
  values: TinaDocument;
}

export interface ActivateMessage {
  type: typeof ACTIVATE_MESSAGE_TYPE;
  address: string;
}

export const readyMessage = (): ReadyMessage => ({ type: READY_MESSAGE_TYPE });

export const valuesMessage = (values: TinaDocument): ValuesMessage => ({
  type: VALUES_MESSAGE_TYPE,
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

export const isValuesMessage = (data: unknown): data is ValuesMessage =>
  hasMessageType(data, VALUES_MESSAGE_TYPE) &&
  typeof (data as { values?: unknown }).values === 'object' &&
  (data as { values?: unknown }).values !== null;

// Also validates the payload: toFieldAddress throws on an empty address, so a
// malformed message must not pass the guard.
export const isActivateMessage = (data: unknown): data is ActivateMessage =>
  hasMessageType(data, ACTIVATE_MESSAGE_TYPE) &&
  typeof (data as { address?: unknown }).address === 'string' &&
  (data as { address: string }).address.length > 0;

// The marker half of the protocol: how a site tags a rendered element with the
// field address a click should activate. Spreadable — <h1 {...tinaField('title')}>.
export const TINA_FIELD_ATTR = 'data-tina-field';

export const tinaField = (address: string): { 'data-tina-field': string } => ({
  [TINA_FIELD_ATTR]: address,
});
