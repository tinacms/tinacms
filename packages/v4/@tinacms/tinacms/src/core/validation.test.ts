import { describe, expect, it } from 'vitest';
import { corePlugins, t } from '../plugins/fields';
import type {
  FieldDescriptor,
  PluginValidationContext,
  ValidatorFactory,
  ValidatorRegistry,
} from './field/contract';
import { resolveFieldPlugins } from './field/registry';
import type { ValidatorRef } from './schema/types';
import { validateField, validateFieldTree } from './validation';

const titleNode = t.string({ name: 'title', label: 'Title' });

const descriptorWith = (
  validate: FieldDescriptor['validate']
): FieldDescriptor => ({ Component: () => null, validate });

describe('validateField custom layer', () => {
  it('passes the node and address to the descriptor validate', () => {
    let seen: PluginValidationContext | undefined;
    const descriptor = descriptorWith((_value, ctx) => {
      seen = ctx;
      return null;
    });
    validateField(titleNode, descriptor, 'hello', { address: 'items.0.title' });
    expect(seen).toEqual({ node: titleNode, address: 'items.0.title' });
  });

  it('defaults the address to the node name', () => {
    let seen: PluginValidationContext | undefined;
    const descriptor = descriptorWith((_value, ctx) => {
      seen = ctx;
      return null;
    });
    validateField(titleNode, descriptor, 'hello');
    expect(seen?.address).toBe('title');
  });

  it('flattens an array of messages from the descriptor validate', () => {
    const descriptor = descriptorWith(() => ['Too short', 'Too plain']);
    expect(validateField(titleNode, descriptor, 'x')).toEqual([
      'Too short',
      'Too plain',
    ]);
  });
});

describe('validateField field-level validators', () => {
  const after: ValidatorFactory =
    (other) =>
    (value, { siblings }) => {
      const start = siblings[String(other)];
      if (!value || typeof start !== 'string' || String(value) > start) {
        return null;
      }
      return `Must be after ${other}`;
    };
  const matches: ValidatorFactory =
    (pattern, message = 'Invalid format') =>
    (value) =>
      typeof value === 'string' && !new RegExp(String(pattern)).test(value)
        ? String(message)
        : null;
  const validators: ValidatorRegistry = new Map([
    ['after', after],
    ['matches', matches],
  ]);

  it('runs the validators a field lists, with their args, in order', () => {
    const slug = t.string({
      name: 'slug',
      validators: [
        { name: 'matches', args: ['^[a-z]+$', 'Lowercase only'] },
        { name: 'matches', args: ['^.{3,}$', 'Three or more'] },
      ],
    });
    expect(
      validateField(
        slug,
        descriptorWith(() => null),
        'AB',
        { validators }
      )
    ).toEqual(['Lowercase only', 'Three or more']);
  });

  it('runs field-level validators after the plugin validate', () => {
    const slug = t.string({
      name: 'slug',
      validators: [{ name: 'matches', args: ['^[a-z]+$', 'Lowercase only'] }],
    });
    expect(
      validateField(
        slug,
        descriptorWith(() => 'Plugin first'),
        'AB',
        {
          validators,
        }
      )
    ).toEqual(['Plugin first', 'Lowercase only']);
  });

  it('gives a field-level validator its siblings and the document', () => {
    const endDate = t.string({
      name: 'endDate',
      validators: [{ name: 'after', args: ['startDate'] }],
    });
    const siblings = { startDate: '2026-02-01', endDate: '2026-01-01' };
    expect(
      validateField(endDate, undefined, '2026-01-01', {
        validators,
        siblings,
        values: { events: [siblings] },
      })
    ).toEqual(['Must be after startDate']);
  });

  it('does not give the plugin validate any siblings', () => {
    let seen: PluginValidationContext | undefined;
    validateField(
      titleNode,
      descriptorWith((_value, context) => {
        seen = context;
        return null;
      }),
      'ok',
      { validators, siblings: { title: 'ok' }, values: { title: 'ok' } }
    );
    expect(seen).toEqual({ node: titleNode, address: 'title' });
  });

  it('only accepts args that serialise to JSON', () => {
    const ref: ValidatorRef = {
      name: 'after',
      // @ts-expect-error a function cannot live in tina-lock.json
      args: [() => 'startDate'],
    };
    expect(ref.name).toBe('after');
  });

  it('throws on a validator name nothing registered', () => {
    const slug = t.string({
      name: 'slug',
      validators: [{ name: 'missing' }],
    });
    expect(() =>
      validateField(slug, undefined, 'x', { validators })
    ).toThrowError(/missing/);
  });
});

describe('validateFieldTree field-level validators', () => {
  const sameAs: ValidatorFactory =
    (other) =>
    (value, { siblings }) =>
      value === siblings[String(other)] ? null : `Must equal ${other}`;
  const validators: ValidatorRegistry = new Map([['sameAs', sameAs]]);

  it('scopes siblings to the array item the field sits in', async () => {
    const registry = await resolveFieldPlugins(corePlugins);
    const authors = t.array({
      name: 'authors',
      fields: [
        t.string({ name: 'name' }),
        t.string({
          name: 'alias',
          validators: [{ name: 'sameAs', args: ['name'] }],
        }),
      ],
    });
    const items = [
      { name: 'Ann', alias: 'Ann' },
      { name: 'Bob', alias: 'Rob' },
    ];
    expect(
      validateFieldTree(
        authors,
        registry.get('array'),
        items,
        'authors',
        registry,
        {
          validators,
          siblings: { authors: items },
          values: { authors: items },
        }
      )
    ).toEqual({ 'authors.1.alias': ['Must equal name'] });
  });

  it('scopes siblings to the object the field sits in', async () => {
    const registry = await resolveFieldPlugins(corePlugins);
    const seo = t.object({
      name: 'seo',
      fields: [
        t.string({ name: 'title' }),
        t.string({
          name: 'ogTitle',
          validators: [{ name: 'sameAs', args: ['title'] }],
        }),
      ],
    });
    const value = { title: 'A', ogTitle: 'B' };
    expect(
      validateFieldTree(seo, registry.get('object'), value, 'seo', registry, {
        validators,
        siblings: { seo: value },
        values: { seo: value },
      })
    ).toEqual({ 'seo.ogTitle': ['Must equal title'] });
  });
});
