import { describe, expect, it } from 'vitest';

import { resolveSaveOptions } from './save-options';

describe('resolveSaveOptions', () => {
  it('defaults to draft as the main action', () => {
    expect(resolveSaveOptions('draft', false)).toEqual({
      main: 'draft',
      menu: ['review', 'publish'],
    });
  });

  it('uses the remembered choice as the main action', () => {
    expect(resolveSaveOptions('review', false)).toEqual({
      main: 'review',
      menu: ['draft', 'publish'],
    });
  });

  it('keeps publish as main when it is enabled', () => {
    expect(resolveSaveOptions('publish', false)).toEqual({
      main: 'publish',
      menu: ['draft', 'review'],
    });
  });

  it('falls back to draft when the remembered choice is a disabled publish', () => {
    expect(resolveSaveOptions('publish', true)).toEqual({
      main: 'draft',
      menu: ['review', 'publish'],
    });
  });

  it('always lists the other options in a stable order', () => {
    // publish stays in the menu even when disabled, so it can render greyed out.
    expect(resolveSaveOptions('draft', true).menu).toEqual([
      'review',
      'publish',
    ]);
  });
});
