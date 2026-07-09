import type { Brand } from '../brand';
import { invariant } from '../invariant';

export type FieldAddress = Brand<string, 'FieldAddress'>;

export const toFieldAddress = (path: string): FieldAddress => {
  invariant(
    path.length > 0,
    'field-address-empty',
    'A field address must be a non-empty path.'
  );
  return path as FieldAddress;
};
