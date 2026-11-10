import { describe, expect, it } from 'vitest';
import { t } from '../index';
import {
  countFailingFields,
  failingLeaves,
  inDocumentOrder,
  rekeyAddresses,
} from './field-errors';

describe('countFailingFields', () => {
  it('counts one missing title in a list item once, not once per parent address', () => {
    expect(countFailingFields(['blocks', 'blocks.0', 'blocks.0.title'])).toBe(
      1
    );
  });

  it('counts sibling failures separately', () => {
    expect(
      countFailingFields(['title', 'blocks', 'blocks.0.title', 'blocks.1.body'])
    ).toBe(3);
  });

  it('does not treat a longer name as a child', () => {
    expect(countFailingFields(['title', 'titleAlt'])).toBe(2);
  });
});

describe('failingLeaves', () => {
  it('keeps the innermost failing addresses', () => {
    expect(
      failingLeaves(['blocks', 'blocks.0', 'blocks.0.title', 'name'])
    ).toEqual(['blocks.0.title', 'name']);
  });
});

describe('inDocumentOrder', () => {
  const fields = [
    t.string({ name: 'title' }),
    t.object({ name: 'seo', fields: [t.string({ name: 'metaTitle' })] }),
    t.array({ name: 'items', fields: [t.string({ name: 'heading' })] }),
    t.string({ name: 'footer' }),
  ];
  const at = (...addresses: string[]) =>
    addresses.map((address) => ({ address }));
  const order = (addresses: string[]) =>
    inDocumentOrder(at(...addresses), fields, () => undefined).map(
      (entry) => entry.address
    );

  it('sorts by schema order, whatever the order of the error map', () => {
    expect(order(['footer', 'seo.metaTitle', 'title'])).toEqual([
      'title',
      'seo.metaTitle',
      'footer',
    ]);
  });

  it('sorts list items by index, numerically', () => {
    expect(order(['items.10.heading', 'items.2.heading', 'footer'])).toEqual([
      'items.2.heading',
      'items.10.heading',
      'footer',
    ]);
  });
});

describe('rekeyAddresses', () => {
  const list = 'items';

  it('shifts items at and after an insert', () => {
    expect(
      rekeyAddresses(['items.0.a', 'items.2.a', 'x'], list, { insert: 1 })
    ).toEqual(['items.0.a', 'items.3.a', 'x']);
  });

  it('drops an address under a removed item and closes the gap', () => {
    expect(
      rekeyAddresses(['items.1.a', 'items.2.a', 'items.3.a'], list, {
        remove: 2,
      })
    ).toEqual(['items.1.a', 'items.2.a']);
  });

  it('follows a moved item up and shifts the ones it passes', () => {
    expect(
      rekeyAddresses(['items.1.a', 'items.2.a', 'items.3.a'], list, {
        move: [2, 1],
      })
    ).toEqual(['items.2.a', 'items.1.a', 'items.3.a']);
  });

  it('follows a moved item down', () => {
    expect(
      rekeyAddresses(['items.0.a', 'items.1.a', 'items.2.a'], list, {
        move: [0, 2],
      })
    ).toEqual(['items.2.a', 'items.0.a', 'items.1.a']);
  });

  it('keeps the tail of a nested address and ignores other lists', () => {
    expect(
      rekeyAddresses(['items.0.steps.1.text', 'itemsAlt.0.a'], list, {
        insert: 0,
      })
    ).toEqual(['items.1.steps.1.text', 'itemsAlt.0.a']);
  });

  it('shifts a scalar list item that is the address itself', () => {
    expect(rekeyAddresses(['tags.2'], 'tags', { remove: 0 })).toEqual([
      'tags.1',
    ]);
  });
});
