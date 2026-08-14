import { describe, expect, it } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { type FieldEquality, sameValue } from '../core/form/compare';
import {
  type FormId,
  fieldDirty,
  formStatus,
  isEdited,
  toDocument,
  toFormId,
  toFormValues,
  useFormStore,
} from './form-store';

const title = toFieldAddress('title');
const postA = toFormId('posts/a.mdx');
const postB = toFormId('posts/b.mdx');
const store = useFormStore;
const statusOf = (formId: FormId) => formStatus(store.getState().forms[formId]);

describe('form-store registration', () => {
  it('a freshly registered form is pristine', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(statusOf(postA)).toBe('pristine');
  });

  it('re-registering a pristine form adopts the new content', () => {
    store.getState().registerForm(postA, { [title]: 'Old' });
    store.getState().registerForm(postA, { [title]: 'New' });
    expect(store.getState().forms[postA].values[title]).toBe('New');
    expect(statusOf(postA)).toBe('pristine');
  });

  it('re-registering an edited form keeps in-progress edits', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA].values[title]).toBe('Edited');
    expect(statusOf(postA)).toBe('dirty');
  });

  it('re-registering a saved form keeps the saved values', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved');
    store.getState().markSaved(postA);
    store.getState().registerForm(postA, { [title]: 'Saved' });
    expect(store.getState().forms[postA].values[title]).toBe('Saved');
    expect(statusOf(postA)).toBe('clean');
  });

  it('re-registering a saved form adopts content that changed after the save', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved');
    store.getState().markSaved(postA);
    store.getState().registerForm(postA, { [title]: 'Changed on disk' });
    expect(store.getState().forms[postA].values[title]).toBe('Changed on disk');
    expect(statusOf(postA)).toBe('pristine');
  });
});

describe('form-store document round trip', () => {
  it('toDocument inverts toFormValues key for key, on a copy', () => {
    const document = { title: 'Hello', featured: true };
    const values = toFormValues(document);
    const roundTripped = toDocument(values);
    expect(roundTripped).toEqual(document);
    expect(roundTripped).not.toBe(values);
  });
});

describe('form-store dirty tracking', () => {
  it('an edit moves a form from pristine to dirty', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Goodbye');
    expect(statusOf(postA)).toBe('dirty');
  });

  it('editing back to the baseline value is clean, not pristine', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Goodbye');
    store.getState().setFieldValue(postA, title, 'Hello');
    expect(statusOf(postA)).toBe('clean');
  });

  it('clearing a never-baselined field back to undefined is clean, not dirty', () => {
    const subtitle = toFieldAddress('subtitle');
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, subtitle, 'x');
    expect(statusOf(postA)).toBe('dirty');
    store.getState().setFieldValue(postA, subtitle, undefined);
    expect(statusOf(postA)).toBe('clean');
  });

  it('an object value that is edited and reverted is clean, not dirty', () => {
    const hero = toFieldAddress('hero');
    store.getState().registerForm(postA, { [hero]: { heading: 'Hello' } });
    store.getState().setFieldValue(postA, hero, { heading: 'Goodbye' });
    expect(statusOf(postA)).toBe('dirty');
    expect(fieldDirty(store.getState().forms[postA], hero)).toBe(true);

    store.getState().setFieldValue(postA, hero, { heading: 'Hello' });
    expect(statusOf(postA)).toBe('clean');
    expect(fieldDirty(store.getState().forms[postA], hero)).toBe(false);
  });

  it('a list value that is edited and reverted is clean, not dirty', () => {
    const tags = toFieldAddress('tags');
    store.getState().registerForm(postA, { [tags]: ['news', 'release'] });
    store.getState().setFieldValue(postA, tags, ['news']);
    expect(statusOf(postA)).toBe('dirty');

    store.getState().setFieldValue(postA, tags, ['news', 'release']);
    expect(statusOf(postA)).toBe('clean');
    expect(fieldDirty(store.getState().forms[postA], tags)).toBe(false);
  });
});

describe('form-store save reset', () => {
  it('markSaved rebases the baseline and returns the form to clean', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved value');
    expect(statusOf(postA)).toBe('dirty');

    store.getState().markSaved(postA);
    expect(statusOf(postA)).toBe('clean');

    store.getState().setFieldValue(postA, title, 'Hello');
    expect(statusOf(postA)).toBe('dirty');
  });

  it('markSaved with a pre-save snapshot keeps in-flight edits dirty', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved value');
    const snapshot = { ...store.getState().forms[postA].values };

    store.getState().setFieldValue(postA, title, 'Newer edit');
    store.getState().markSaved(postA, snapshot);
    expect(statusOf(postA)).toBe('dirty');

    store.getState().setFieldValue(postA, title, 'Saved value');
    expect(statusOf(postA)).toBe('clean');
  });
});

describe('form-store structural value equality', () => {
  const body = toFieldAddress('body');
  const ast = () => ({
    type: 'root',
    children: [{ type: 'p', children: [{ type: 'text', text: 'Prose.' }] }],
  });

  it('treats an equal-but-cloned structure as unchanged', () => {
    store.getState().registerForm(postA, { [body]: ast() });
    store.getState().setFieldValue(postA, body, ast());
    expect(statusOf(postA)).toBe('pristine');
  });

  it('returns to clean when markSaved baselines a clone of the saved value', () => {
    store.getState().registerForm(postA, { [body]: ast() });
    const edited = ast();
    edited.children[0].children[0].text = 'Edited.';
    store.getState().setFieldValue(postA, body, edited);
    expect(statusOf(postA)).toBe('dirty');

    const savedClone = JSON.parse(JSON.stringify(edited));
    store.getState().markSaved(postA, { [body]: savedClone });
    expect(statusOf(postA)).toBe('clean');
  });

  it('still reports a genuine structural change as dirty', () => {
    store.getState().registerForm(postA, { [body]: ast() });
    const edited = ast();
    edited.children[0].children[0].text = 'Different.';
    store.getState().setFieldValue(postA, body, edited);
    expect(statusOf(postA)).toBe('dirty');
  });
});

describe('form-store field-supplied equality', () => {
  const body = toFieldAddress('body');
  type Body = { source: string; editorOnly: number };
  const equal: FieldEquality = (address, a, b) =>
    address === body
      ? (a as Body | undefined)?.source === (b as Body | undefined)?.source
      : sameValue(a, b);
  const withSource = (source: string, editorOnly: number): Body => ({
    source,
    editorOnly,
  });

  it('a write the document would not see is not an edit', () => {
    store
      .getState()
      .registerForm(postA, { [body]: withSource('Prose.', 0) }, equal);
    store.getState().setFieldValue(postA, body, withSource('Prose.', 1));
    expect(statusOf(postA)).toBe('pristine');
  });

  it('an edit that is undone returns the form to clean', () => {
    store
      .getState()
      .registerForm(postA, { [body]: withSource('Prose.', 0) }, equal);
    store.getState().setFieldValue(postA, body, withSource('Edited.', 1));
    expect(statusOf(postA)).toBe('dirty');
    expect(fieldDirty(store.getState().forms[postA], body)).toBe(true);

    store.getState().setFieldValue(postA, body, withSource('Prose.', 2));
    expect(statusOf(postA)).toBe('clean');
    expect(fieldDirty(store.getState().forms[postA], body)).toBe(false);
  });

  it('keeps the equality of the form across an edit and a save', () => {
    store
      .getState()
      .registerForm(postA, { [body]: withSource('Prose.', 0) }, equal);
    const edited = withSource('Edited.', 1);
    store.getState().setFieldValue(postA, body, edited);
    store.getState().markSaved(postA, { [body]: edited });
    expect(statusOf(postA)).toBe('clean');

    store.getState().setFieldValue(postA, body, withSource('Edited.', 2));
    expect(statusOf(postA)).toBe('clean');
  });

  it('compares as structure when the form registers no equality', () => {
    store.getState().registerForm(postA, { [body]: withSource('Prose.', 0) });
    store.getState().setFieldValue(postA, body, withSource('Prose.', 1));
    expect(statusOf(postA)).toBe('dirty');
  });
});

describe('form-store error mirror', () => {
  const scope = () => store.getState().forms[postA];
  const errorsOf = () => {
    const current = scope();
    if (!isEdited(current)) throw new Error('expected an edited scope');
    return current.errors;
  };

  it('stores mirrored errors on an edited scope and clears them on a clean write', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'x');
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    expect(errorsOf()[title]).toEqual(['Too short']);

    store.getState().setFieldErrors(postA, {});
    expect(errorsOf()).toEqual({});
  });

  it('no-ops on a pristine scope — never validated, nothing to mirror', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    expect(scope().status).toBe('pristine');
    expect(statusOf(postA)).toBe('pristine');
  });

  it('an equal map write and an error write both preserve identities they must not churn', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'x');
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    const before = scope();

    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    expect(scope()).toBe(before);

    store.getState().setFieldErrors(postA, {});
    expect(scope().values).toBe(before.values);
  });

  it('value writes preserve mirrored errors until RHF re-derives', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'x');
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    store.getState().setFieldValue(postA, title, 'xy');
    expect(errorsOf()[title]).toEqual(['Too short']);
  });

  it('markSaved carries errors through', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'x');
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    store.getState().markSaved(postA);
    expect(errorsOf()[title]).toEqual(['Too short']);
  });
});

describe('form-store multiple forms', () => {
  it('tracks open forms independently without overwriting each other', () => {
    store.getState().registerForm(postA, { [title]: 'A' });
    store.getState().registerForm(postB, { [title]: 'B' });

    store.getState().setFieldValue(postA, title, 'A edited');

    expect(statusOf(postA)).toBe('dirty');
    expect(statusOf(postB)).toBe('pristine');
    expect(store.getState().forms[postB].values[title]).toBe('B');
  });
});

describe('form-store per-field dirty', () => {
  it('reports dirty per field and stays clean for siblings and missing forms', () => {
    const slug = toFieldAddress('slug');
    store.getState().registerForm(postA, { [title]: 'Hi', [slug]: 'hi' });
    const scope = () => store.getState().forms[postA];
    expect(fieldDirty(scope(), title)).toBe(false);

    store.getState().setFieldValue(postA, title, 'Changed');
    expect(fieldDirty(scope(), title)).toBe(true);
    expect(fieldDirty(scope(), slug)).toBe(false);
    expect(fieldDirty(store.getState().forms[toFormId('missing')], title)).toBe(
      false
    );
  });
});

describe('form-store discarded edits', () => {
  it('puts the form back on its baseline, and back to pristine', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    expect(statusOf(postA)).toBe('dirty');

    store.getState().discardEdits(postA);
    expect(store.getState().forms[postA].values[title]).toBe('Hello');
    expect(statusOf(postA)).toBe('pristine');
  });

  it('discards back to the last save, and not to the loaded content', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved value');
    store.getState().markSaved(postA);
    store.getState().setFieldValue(postA, title, 'Later edit');

    store.getState().discardEdits(postA);
    expect(store.getState().forms[postA].values[title]).toBe('Saved value');
  });

  it('drops the mirrored errors with the edits that raised them', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'x');
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });

    store.getState().discardEdits(postA);
    expect(isEdited(store.getState().forms[postA])).toBe(false);
  });

  it('keeps the equality of the form, so the next edit compares the same way', () => {
    const equal: FieldEquality = (_address, a, b) => sameValue(a, b);
    store.getState().registerForm(postA, { [title]: 'Hello' }, equal);
    store.getState().setFieldValue(postA, title, 'Edited');
    store.getState().discardEdits(postA);
    expect(store.getState().forms[postA].equal).toBe(equal);
  });

  it('leaves a pristine form and an unopened form alone', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    const pristine = store.getState().forms[postA];
    store.getState().discardEdits(postA);
    expect(store.getState().forms[postA]).toBe(pristine);

    expect(() => store.getState().discardEdits(postB)).not.toThrow();
    expect(store.getState().forms[postB]).toBeUndefined();
  });

  it('discards one form without touching another', () => {
    store.getState().registerForm(postA, { [title]: 'A' });
    store.getState().registerForm(postB, { [title]: 'B' });
    store.getState().setFieldValue(postA, title, 'A edited');
    store.getState().setFieldValue(postB, title, 'B edited');

    store.getState().discardEdits(postA);
    expect(statusOf(postA)).toBe('pristine');
    expect(statusOf(postB)).toBe('dirty');
    expect(store.getState().forms[postB].values[title]).toBe('B edited');
  });
});

describe('form-store teardown', () => {
  it('removeForm drops the scope', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().removeForm(postA);
    expect(store.getState().forms[postA]).toBeUndefined();
    expect(statusOf(postA)).toBe('pristine');
  });

  it('removeForm of an unopened form is a no-op', () => {
    expect(() => store.getState().removeForm(postA)).not.toThrow();
    expect(store.getState().forms[postA]).toBeUndefined();
  });
});

describe('form-store guards on unopened forms', () => {
  it('toFormId rejects an empty path', () => {
    expect(() => toFormId('')).toThrow();
  });

  it('setFieldValue on an unopened form is a no-op', () => {
    store.getState().setFieldValue(postA, title, 'orphan');
    expect(store.getState().forms[postA]).toBeUndefined();
  });

  it('markSaved on an unopened form is a no-op', () => {
    store.getState().markSaved(postA);
    expect(store.getState().forms[postA]).toBeUndefined();
  });
});

describe('form-store reference stability', () => {
  it('re-setting a field to its current value leaves the scope untouched', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    const before = store.getState().forms[postA];
    store.getState().setFieldValue(postA, title, 'Hello');
    expect(store.getState().forms[postA]).toBe(before);
    expect(statusOf(postA)).toBe('pristine');
  });

  it('markSaved on a never-edited form leaves it clean', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().markSaved(postA);
    expect(statusOf(postA)).toBe('clean');
  });
});
