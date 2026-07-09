import { beforeEach, describe, expect, it } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import {
  type FormId,
  fieldDirty,
  formStatus,
  toFormId,
  useFormStore,
} from './form-store';

const title = toFieldAddress('title');
const postA = toFormId('posts/a.mdx');
const postB = toFormId('posts/b.mdx');
const store = useFormStore;
const statusOf = (formId: FormId) => formStatus(store.getState().forms[formId]);

beforeEach(() => {
  store.setState({ forms: {} });
});

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
    // A remount re-registers with the original values — the live edit must survive.
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA].values[title]).toBe('Edited');
    expect(statusOf(postA)).toBe('dirty');
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
    // RHF emits undefined on clear; absent and undefined are one state (JSON can't
    // represent "present but undefined"), so this must read clean.
    store.getState().setFieldValue(postA, subtitle, undefined);
    expect(statusOf(postA)).toBe('clean');
  });

  // Composite field values (object/list/rich-text) aren't supported yet; when they land,
  // `valuesEqual`/`fieldDirty` must delegate equality to the field descriptor (each field
  // type owns its comparison) so an edit-then-revert of an object field reads clean rather
  // than permanently dirty, and setFieldValue's no-op guard doesn't drop an in-place-mutated
  // value. See the notes on those functions.
  it.todo(
    'object/list values: edit-then-revert is clean, not permanently dirty'
  );
});

describe('form-store save reset', () => {
  it('markSaved rebases the baseline and returns the form to clean', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Saved value');
    expect(statusOf(postA)).toBe('dirty');

    store.getState().markSaved(postA);
    expect(statusOf(postA)).toBe('clean');

    // Baseline moved to the saved value: returning to the original is now dirty.
    store.getState().setFieldValue(postA, title, 'Hello');
    expect(statusOf(postA)).toBe('dirty');
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
    expect(fieldDirty(store.getState().forms.missing, title)).toBe(false);
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
    // No churn: same scope object, still pristine.
    expect(store.getState().forms[postA]).toBe(before);
    expect(statusOf(postA)).toBe('pristine');
  });

  it('markSaved on a never-edited form leaves it clean', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().markSaved(postA);
    expect(statusOf(postA)).toBe('clean');
  });
});
