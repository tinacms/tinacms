import type { TinaDocument } from '../core/schema/types';

export const READY_MESSAGE_TYPE = 'tina:ready';
export const VALUES_MESSAGE_TYPE = 'tina:values';
export const ACTIVATE_MESSAGE_TYPE = 'tina:activate';

export interface ReadyMessage {
  type: typeof READY_MESSAGE_TYPE;
}

export interface ValuesMessage {
  type: typeof VALUES_MESSAGE_TYPE;
  values: TinaDocument;
  /** The branch the editor's media plugin reads from; absent for the media branch. */
  mediaBranch?: string;
}

export interface ActivateMessage {
  type: typeof ACTIVATE_MESSAGE_TYPE;
  address: string;
}

export const readyMessage = (): ReadyMessage => ({ type: READY_MESSAGE_TYPE });

export const valuesMessage = (
  values: TinaDocument,
  mediaBranch?: string
): ValuesMessage => ({
  type: VALUES_MESSAGE_TYPE,
  values,
  ...(mediaBranch === undefined ? {} : { mediaBranch }),
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
  (data as { values?: unknown }).values !== null &&
  ['undefined', 'string'].includes(
    typeof (data as { mediaBranch?: unknown }).mediaBranch
  );

export const isActivateMessage = (data: unknown): data is ActivateMessage =>
  hasMessageType(data, ACTIVATE_MESSAGE_TYPE) &&
  typeof (data as { address?: unknown }).address === 'string' &&
  (data as { address: string }).address.length > 0;

export const TINA_FIELD_ATTR = 'data-tina-field';

export const tinaField = (address: string): { 'data-tina-field': string } => ({
  [TINA_FIELD_ATTR]: address,
});
