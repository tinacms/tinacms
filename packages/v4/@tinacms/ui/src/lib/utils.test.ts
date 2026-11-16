import { describe, expect, it } from 'vitest';

import { cn } from '@tinacms/ui/lib/utils';

describe('cn', () => {
  it('lets a later shadow replace a design shadow token', () => {
    expect(cn('focus:shadow-focus-field', 'focus:shadow-none')).toBe(
      'focus:shadow-none'
    );
    expect(cn('shadow-popover', 'shadow-segment')).toBe('shadow-segment');
  });
});
