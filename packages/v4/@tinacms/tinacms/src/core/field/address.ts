import type { Brand } from '../brand';

export type FieldAddress = Brand<string, 'FieldAddress'>;

export const toFieldAddress = (path: string): FieldAddress => {
  if (path.length === 0) {
    throw new Error('A field address must be a non-empty path.');
  }
  return path as FieldAddress;
};
