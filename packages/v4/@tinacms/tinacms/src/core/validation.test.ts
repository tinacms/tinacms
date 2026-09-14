import { describe, expect, it } from 'vitest';
import { t } from '../plugins/fields';
import type {
  FieldDescriptor,
  PluginValidationContext,
} from './field/contract';
import { validateField } from './validation';

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
