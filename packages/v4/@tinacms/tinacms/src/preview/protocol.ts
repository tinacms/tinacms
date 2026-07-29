import type { TinaDocument } from '../core/schema/types';

// The wire protocol for visual editing (the v4 part of #6944). It carries three
// messages across the boundary between the editor window and the preview window. The
// `tina:activate` message holds the field address and nothing else (ADR-009 §4). The
// `tina:ready` message is the handshake from the preview to the editor. The
// `tina:values` message streams the whole state from the editor to the preview. This
// package owns both of those messages, and it ships both halves together. There is
// therefore no version field and no form id field. A new need becomes a new message
// type.

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

// This also validates the payload. toFieldAddress throws on an empty address, so a
// damaged message must not pass this guard.
export const isActivateMessage = (data: unknown): data is ActivateMessage =>
  hasMessageType(data, ACTIVATE_MESSAGE_TYPE) &&
  typeof (data as { address?: unknown }).address === 'string' &&
  (data as { address: string }).address.length > 0;

// The marker half of the protocol. A site uses it to tag a rendered element with the
// field address that a click activates. Spread it onto the element, for example
// <h1 {...tinaField('title')}>.
export const TINA_FIELD_ATTR = 'data-tina-field';

export const tinaField = (address: string): { 'data-tina-field': string } => ({
  [TINA_FIELD_ATTR]: address,
});
