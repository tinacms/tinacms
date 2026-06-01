import type { TinaField } from '@tinacms/schema-tools';
import {
  addVariablesToCode,
  makeFieldsWithInternalCode,
  makeTemplateFile,
} from './codeTransformer';
import { isForestrySafeString } from './naming';

// Characterization + regression tests for the Forestry-migration code
// generator. The generator round-trips generated code expressions through a
// `JSON.stringify` pass using an internal marker, then un-quotes the marked
// values back into raw source. User-authored Forestry YAML (labels, names,
// etc.) flows through the *same* `JSON.stringify` call, so the marker must not
// be forgeable from user data.

describe('addVariablesToCode (internal marker round-trip)', () => {
  it('un-quotes an internally generated spread marker into raw code', () => {
    const marker = makeFieldsWithInternalCode({
      hasBody: false,
      field: 'myTemplateFields',
      spread: true,
    }) as string;

    const { code } = addVariablesToCode(JSON.stringify([marker]));

    // The marker is emitted as a bare spread call, no longer a quoted string.
    expect(code).toContain('...myTemplateFields()');
    expect(code).not.toContain('"...myTemplateFields()"');
  });

  it('un-quotes an internally generated (non-spread) marker into raw code', () => {
    const marker = makeFieldsWithInternalCode({
      hasBody: false,
      field: 'myTemplateFields',
    }) as string;

    const { code } = addVariablesToCode(JSON.stringify([marker]));

    expect(code).toContain('myTemplateFields()');
    expect(code).not.toContain('"myTemplateFields()"');
  });

  it('leaves ordinary JSON string values untouched', () => {
    const fields = [{ type: 'string', name: 'title', label: 'Title' }];

    const { code } = addVariablesToCode(JSON.stringify(fields, null, 2));

    expect(code).toContain('"label": "Title"');
  });
});

describe('makeTemplateFile (legitimate generation)', () => {
  it('emits a fields function whose body is the stringified field array', async () => {
    const fields = [
      { type: 'string', name: 'title', label: 'Title' },
    ] as TinaField[];
    const templateMap = new Map([
      ['post', { fields, templateObj: { label: 'Post' } }],
    ]);

    const { importStatements, templateCodeText } = await makeTemplateFile({
      templateMap,
      usingTypescript: true,
    });

    expect(importStatements).toEqual([
      `import { postFields } from './templates'`,
    ]);
    expect(templateCodeText).toContain('export function postFields()');
    expect(templateCodeText).toContain('name: "title"');
    expect(templateCodeText).toContain('label: "Title"');
  });
});

describe('addVariablesToCode (code-injection hardening)', () => {
  // Regression test: a user-controlled label/name carrying the marker sentinel
  // must stay inert data and never be emitted as a bare (executable) identifier.
  it('does not un-quote a user-controlled label wearing the marker sentinel', () => {
    const userControlledLabel = '__TINA_INTERNAL__:::INJECTED_TOKEN:::';
    const fields = [
      { type: 'string', name: 'title', label: userControlledLabel },
    ];

    const { code } = addVariablesToCode(JSON.stringify(fields, null, 2));

    // Must remain a quoted string (preserved, not silently dropped)...
    expect(code).toContain(`"${userControlledLabel}"`);
    // ...and must NOT become a bare identifier assigned to the label key.
    expect(code).not.toMatch(/"label":\s*INJECTED_TOKEN/);
  });
});

describe('addVariablesToCode (mixed trusted + untrusted in one pass)', () => {
  // Mirrors the real `apply.ts` collections path: a single JSON.stringify pass
  // carries both a generator-produced marker (which must be un-quoted into code)
  // and a user-controlled label wearing the public sentinel (which must not).
  it('un-quotes the generator marker but never the user-supplied sentinel', () => {
    const legitMarker = makeFieldsWithInternalCode({
      hasBody: false,
      field: 'heroFields',
      spread: true,
    }) as string;
    const userControlledLabel = '__TINA_INTERNAL__:::INJECTED_TOKEN:::';

    const payload = [
      legitMarker,
      { type: 'string', name: 'title', label: userControlledLabel },
    ];

    const { code } = addVariablesToCode(JSON.stringify(payload, null, 2));

    // Trusted marker becomes bare code...
    expect(code).toContain('...heroFields()');
    expect(code).not.toContain('"...heroFields()"');
    // ...while the untrusted look-alike stays an inert quoted string.
    expect(code).toContain(`"${userControlledLabel}"`);
    expect(code).not.toMatch(/"label":\s*INJECTED_TOKEN/);
  });
});

describe('isForestrySafeString (defence-in-depth input guard)', () => {
  it('accepts ordinary single-line names and labels', () => {
    expect(isForestrySafeString('Title')).toBe(true);
    expect(isForestrySafeString('Hero Block')).toBe(true);
    expect(isForestrySafeString('field_name-1')).toBe(true);
    expect(isForestrySafeString('')).toBe(true);
  });

  it('rejects NUL bytes and newlines that never occur in real Forestry config', () => {
    expect(isForestrySafeString('a\x00b')).toBe(false);
    expect(isForestrySafeString('line1\nline2')).toBe(false);
    expect(isForestrySafeString('line1\r\nline2')).toBe(false);
  });
});

describe('makeTemplateFile (code-injection hardening)', () => {
  it('keeps a user-controlled label wearing the marker sentinel as a string', async () => {
    const userControlledLabel = '__TINA_INTERNAL__:::INJECTED_TOKEN:::';
    const fields = [
      { type: 'string', name: 'title', label: userControlledLabel },
    ] as unknown as TinaField[];
    const templateMap = new Map([
      ['post', { fields, templateObj: { label: 'Post' } }],
    ]);

    const { templateCodeText } = await makeTemplateFile({
      templateMap,
      usingTypescript: true,
    });

    expect(templateCodeText).toContain(userControlledLabel);
    // Prettier emits unquoted keys, so an injection would read `label: INJECTED_TOKEN`.
    expect(templateCodeText).not.toMatch(/label:\s*INJECTED_TOKEN/);
  });
});
