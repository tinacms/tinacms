import type { TinaField } from '../types/index';
import type { TinaSchema } from './TinaSchema';
import { resolveField } from './resolveField';

// resolveField only consults the schema for reference/object fields.
const schema = {} as TinaSchema;

const resolveImage = (field: Partial<TinaField<true>>) =>
  resolveField(
    { type: 'image', name: 'gallery', ...field } as TinaField<true>,
    schema
  );

describe('resolveField — image', () => {
  it('puts accept on the field itself when not a list', () => {
    const resolved = resolveImage({ accept: 'pdf' });

    expect(resolved.component).toBe('image');
    expect(resolved.accept).toBe('pdf');
  });

  // The list plugin builds each item from `field.field` alone, so an accept
  // left only on the outer field never reaches the per-item input.
  it('carries accept into the item field of a list', () => {
    const resolved = resolveImage({ list: true, accept: ['png', 'svg'] });

    expect(resolved.component).toBe('list');
    expect(resolved.field).toEqual({
      component: 'image',
      accept: ['png', 'svg'],
    });
  });

  it('leaves the item field bare when no accept is declared', () => {
    const resolved = resolveImage({ list: true });

    expect(resolved.field).toEqual({ component: 'image' });
  });
});
