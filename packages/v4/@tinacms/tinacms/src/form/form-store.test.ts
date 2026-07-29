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
    // A remount registers the original values again. The live edit must survive that.
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA].values[title]).toBe('Edited');
    expect(statusOf(postA)).toBe('dirty');
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
    // RHF emits undefined when a field clears. An absent key and an undefined value
    // are one state, because JSON cannot hold "present but undefined". This must
    // therefore read clean.
    store.getState().setFieldValue(postA, subtitle, undefined);
    expect(statusOf(postA)).toBe('clean');
  });

  // A composite value arrives as a fresh object on every edit, so a reference test
  // holds it dirty for ever. The default equality compares structure, which is what
  // makes the revert below read clean. Refer to sameValue in core/form/compare.ts.
  it('an object value that is edited and reverted is clean, not dirty', () => {
    const hero = toFieldAddress('hero');
    store.getState().registerForm(postA, { [hero]: { heading: 'Hello' } });
    store.getState().setFieldValue(postA, hero, { heading: 'Goodbye' });
    expect(statusOf(postA)).toBe('dirty');
    expect(fieldDirty(store.getState().forms[postA], hero)).toBe(true);

    // A new object, equal to the baseline in structure alone.
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

    // The baseline is the saved value, so a return to the original value is dirty.
    store.getState().setFieldValue(postA, title, 'Hello');
    expect(statusOf(postA)).toBe('dirty');
  });

  it('markSaved with a pre-save snapshot keeps in-flight edits dirty', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved value');
    const snapshot = { ...store.getState().forms[postA].values };

    // An edit typed during the save. The baseline is the snapshot, and not the
    // current values, so the newer edit still reads dirty.
    store.getState().setFieldValue(postA, title, 'Newer edit');
    store.getState().markSaved(postA, snapshot);
    expect(statusOf(postA)).toBe('dirty');

    // Reverting to what was actually saved is clean against the new baseline.
    store.getState().setFieldValue(postA, title, 'Saved value');
    expect(statusOf(postA)).toBe('clean');
  });
});

// The store reads the formState subscription of RHF, which sends a clone of each value,
// but markSaved keeps the values that RHF holds as the baseline. Two primitives compare
// equal across that split. Two structures never do by reference, so a saved rich-text
// document stayed dirty for ever until the comparison became structural.
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

    // A different object holding the same content, as markSaved receives.
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

// A field whose editor value is richer than its stored form answers for itself, through
// isEqual on its descriptor (core/form/compare.ts). The rich-text field is the one that
// does today: Plate adds an id to every node, so the tree in the editor never matches the
// tree parsed from the file, and structure alone would hold such a document dirty for
// ever. The equality here stands in for that, so this test needs no editor.
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

    // What the editor gives back is never the tree it was given, so this undo carries
    // its own noise. Only the field can tell that the document is back where it was.
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
  // The `errors` map exists only on an edited scope. A pristine form has never been
  // validated, so the store gives it no error map at all, and not an empty one. This
  // narrowing asserts against the real shape.
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

    // The same content in new arrays. RHF builds these again at each keystroke.
    store.getState().setFieldErrors(postA, { [title]: ['Too short'] });
    expect(scope()).toBe(before);

    // A write that differs replaces the errors, and it must keep the values
    // reference. An error write must not look like a value change to the preview
    // wire.
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
    // Pristine, and not clean. A discarded form is the form a fresh load would give,
    // so a remount adopts new content rather than keeping this one.
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
    // Nothing changed. The scope is the same object, and it is still pristine.
    expect(store.getState().forms[postA]).toBe(before);
    expect(statusOf(postA)).toBe('pristine');
  });

  it('markSaved on a never-edited form leaves it clean', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().markSaved(postA);
    expect(statusOf(postA)).toBe('clean');
  });
});
