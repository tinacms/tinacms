import { describe, expect, it } from 'vitest';
import {
  TINA_FIELD_ATTR,
  activateMessage,
  isActivateMessage,
  isReadyMessage,
  isValuesMessage,
  readyMessage,
  tinaField,
  valuesMessage,
} from './protocol';

describe('protocol guards', () => {
  it('each guard accepts its own constructor output', () => {
    expect(isReadyMessage(readyMessage())).toBe(true);
    expect(isValuesMessage(valuesMessage({ title: 'Hello' }))).toBe(true);
    expect(isActivateMessage(activateMessage('title'))).toBe(true);
  });

  it('guards reject the other message types', () => {
    expect(isReadyMessage(valuesMessage({}))).toBe(false);
    expect(isValuesMessage(readyMessage())).toBe(false);
    expect(isActivateMessage(readyMessage())).toBe(false);
  });

  it.each([null, undefined, 'tina:ready', 42, {}, { type: 'tina:unknown' }])(
    'guards reject malformed data: %j',
    (data) => {
      expect(isReadyMessage(data)).toBe(false);
      expect(isValuesMessage(data)).toBe(false);
      expect(isActivateMessage(data)).toBe(false);
    }
  );

  it('rejects a values message whose payload is not an object', () => {
    expect(isValuesMessage({ type: 'tina:values' })).toBe(false);
    expect(isValuesMessage({ type: 'tina:values', values: null })).toBe(false);
    expect(isValuesMessage({ type: 'tina:values', values: 'title' })).toBe(
      false
    );
  });

  it('rejects an activate message without a usable address', () => {
    expect(isActivateMessage({ type: 'tina:activate' })).toBe(false);
    expect(isActivateMessage({ type: 'tina:activate', address: '' })).toBe(
      false
    );
    expect(isActivateMessage({ type: 'tina:activate', address: 7 })).toBe(
      false
    );
  });
});

describe('tinaField', () => {
  it('yields a spreadable marker attribute', () => {
    expect(tinaField('title')).toEqual({ [TINA_FIELD_ATTR]: 'title' });
  });
});
