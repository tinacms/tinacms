import { describe, expect, it } from 'vitest';
import { jsonAdapter } from './json.adapter';

describe('jsonAdapter.serialize', () => {
  it('returns the original bytes when the save changes nothing', () => {
    const previous =
      '{\n  "name": "Ada",\n  "scores": [1, 2, 3],\n  "extra": "kept"\n}\n';
    const saved = jsonAdapter.serialize(
      { name: 'Ada', scores: [1, 2, 3] },
      previous,
      undefined,
      ['name', 'scores']
    );
    expect(saved).toBe(previous);
  });

  it('keeps a file with no trailing newline as it is on an unchanged save', () => {
    const previous = '{"name":"Ada","scores":[1,2,3]}';
    expect(jsonAdapter.serialize({ name: 'Ada' }, previous)).toBe(previous);
  });

  it.each([
    ['an array', '[{"title":"a"},{"title":"b"}]'],
    ['a string', '"hello"'],
    ['null', 'null'],
  ])('refuses to read or save a file that holds %s', (_, previous) => {
    const message = 'A JSON document must hold an object at the top level.';
    expect(() => jsonAdapter.parse(previous)).toThrow(message);
    expect(() => jsonAdapter.serialize({ title: 'x' }, previous)).toThrow(
      message
    );
  });

  it('rewrites the file when a value changes', () => {
    const previous = '{"name":"Ada","scores":[1, 2, 3]}';
    expect(jsonAdapter.serialize({ name: 'Grace' }, previous)).toBe(
      '{\n  "name": "Grace",\n  "scores": [\n    1,\n    2,\n    3\n  ]\n}\n'
    );
  });

  it('removes a cleared schema field and keeps unknown keys', () => {
    const previous = '{"name":"Ada","hero":"a.jpg","extra":"kept"}';
    const saved = jsonAdapter.serialize({ name: 'Ada' }, previous, undefined, [
      'name',
      'hero',
    ]);
    expect(saved).toBe('{\n  "name": "Ada",\n  "extra": "kept"\n}\n');
  });

  it('keeps a key the save leaves out when schemaKeys does not name it', () => {
    const previous = '{"name":"Ada","hero":"a.jpg"}';
    expect(jsonAdapter.serialize({}, previous, undefined, ['name'])).toBe(
      '{\n  "hero": "a.jpg"\n}\n'
    );
    expect(jsonAdapter.serialize({}, previous)).toBe(previous);
  });

  it('writes a new document in the canonical form', () => {
    expect(jsonAdapter.serialize({ name: 'Ada' })).toBe(
      '{\n  "name": "Ada"\n}\n'
    );
  });
});
