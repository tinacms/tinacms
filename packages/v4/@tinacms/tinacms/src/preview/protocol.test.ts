import { describe, expect, it } from 'vitest';
import {
  TINA_DOCUMENT_ATTR,
  TINA_FIELD_ATTR,
  activateMessage,
  documentsMessage,
  isActivateMessage,
  isDocumentsMessage,
  isOutlineMessage,
  isReadyMessage,
  isValuesMessage,
  outlineMessage,
  readyMessage,
  tinaField,
  valuesMessage,
} from './protocol';

const guards = [
  isReadyMessage,
  isDocumentsMessage,
  isValuesMessage,
  isActivateMessage,
  isOutlineMessage,
];

describe('protocol guards', () => {
  it('each guard accepts its own constructor output', () => {
    const docs = [
      { path: 'content/a.md' },
      { path: 'content/b.md', shared: true },
    ];
    expect(isReadyMessage(readyMessage())).toBe(true);
    expect(isReadyMessage(readyMessage(docs, 'http://x/y'))).toBe(true);
    expect(isDocumentsMessage(documentsMessage(docs, 'http://x/y'))).toBe(true);
    expect(
      isValuesMessage(valuesMessage({ title: 'Hello' }, 'content/a.md'))
    ).toBe(true);
    expect(isActivateMessage(activateMessage('title', 'content/a.md'))).toBe(
      true
    );
    expect(
      isOutlineMessage(
        outlineMessage(
          { address: 'title' },
          { address: 'blocks.1', document: 'content/a.md', name: 'Block' }
        )
      )
    ).toBe(true);
    expect(isOutlineMessage(outlineMessage(null, null))).toBe(true);
  });

  it('keeps accepting the old shapes', () => {
    expect(isReadyMessage({ type: 'tina:ready' })).toBe(true);
    expect(isValuesMessage({ type: 'tina:values', values: {} })).toBe(true);
    expect(isActivateMessage({ type: 'tina:activate', address: 'title' })).toBe(
      true
    );
    expect(isDocumentsMessage({ type: 'tina:documents', documents: [] })).toBe(
      true
    );
  });

  it('builders leave optional fields out rather than undefined', () => {
    expect(readyMessage()).toEqual({ type: 'tina:ready' });
    expect(Object.keys(activateMessage('title'))).toEqual(['type', 'address']);
    expect(Object.keys(valuesMessage({}))).toEqual(['type', 'values']);
  });

  it('guards reject the other message types', () => {
    const samples = [
      readyMessage(),
      documentsMessage([]),
      valuesMessage({}),
      activateMessage('title'),
      outlineMessage(null, null),
    ];
    samples.forEach((sample, index) => {
      guards.forEach((guard, guardIndex) => {
        expect(guard(sample)).toBe(index === guardIndex);
      });
    });
  });

  it.each([null, undefined, 'tina:ready', 42, {}, { type: 'tina:unknown' }])(
    'guards reject malformed data: %j',
    (data) => {
      for (const guard of guards) expect(guard(data)).toBe(false);
    }
  );

  it('rejects a values message whose payload is not an object or whose document is not a string', () => {
    expect(isValuesMessage({ type: 'tina:values' })).toBe(false);
    expect(isValuesMessage({ type: 'tina:values', values: null })).toBe(false);
    expect(isValuesMessage({ type: 'tina:values', values: 'title' })).toBe(
      false
    );
    expect(
      isValuesMessage({ type: 'tina:values', values: {}, document: 7 })
    ).toBe(false);
  });

  it('rejects an activate message without a usable address or with a bad document', () => {
    expect(isActivateMessage({ type: 'tina:activate' })).toBe(false);
    expect(isActivateMessage({ type: 'tina:activate', address: '' })).toBe(
      false
    );
    expect(isActivateMessage({ type: 'tina:activate', address: 7 })).toBe(
      false
    );
    expect(
      isActivateMessage({ type: 'tina:activate', address: 'a', document: 7 })
    ).toBe(false);
  });

  it('rejects bad url and documents on ready and documents messages', () => {
    for (const guard of [isReadyMessage, isDocumentsMessage]) {
      const type = guard === isReadyMessage ? 'tina:ready' : 'tina:documents';
      expect(guard({ type, documents: [], url: 7 })).toBe(false);
      expect(guard({ type, documents: 'a' })).toBe(false);
      expect(guard({ type, documents: [{}] })).toBe(false);
      expect(guard({ type, documents: [{ path: '' }] })).toBe(false);
      expect(guard({ type, documents: [{ path: 7 }] })).toBe(false);
      expect(guard({ type, documents: [null] })).toBe(false);
    }
    expect(isDocumentsMessage({ type: 'tina:documents' })).toBe(false);
  });

  it('rejects outline messages with a malformed mark', () => {
    const type = 'tina:outline';
    expect(isOutlineMessage({ type, hovered: null })).toBe(false);
    expect(
      isOutlineMessage({ type, hovered: { address: '' }, active: null })
    ).toBe(false);
    expect(
      isOutlineMessage({
        type,
        hovered: { address: 'a', document: 1 },
        active: null,
      })
    ).toBe(false);
    expect(
      isOutlineMessage({ type, hovered: null, active: { address: 'a' } })
    ).toBe(false);
  });
});

describe('tinaField', () => {
  it('yields a spreadable marker attribute', () => {
    expect(tinaField('title')).toEqual({ [TINA_FIELD_ATTR]: 'title' });
  });

  it('adds the document attribute when given a document', () => {
    expect(tinaField('title', 'content/a.md')).toEqual({
      [TINA_FIELD_ATTR]: 'title',
      [TINA_DOCUMENT_ATTR]: 'content/a.md',
    });
  });
});
