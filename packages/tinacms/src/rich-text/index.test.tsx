import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { TinaMarkdown } from './index';

describe('TinaMarkdown URL sanitization', () => {
  it('drops an unsafe link URL', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [
              {
                type: 'a',
                url: 'javascript:alert(1)',
                children: [{ type: 'text', text: 'link' }],
              },
            ],
          } as any
        }
      />
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('');
  });

  it('preserves a safe link URL', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [
              {
                type: 'a',
                url: 'https://example.com/path',
                children: [{ type: 'text', text: 'link' }],
              },
            ],
          } as any
        }
      />
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('https://example.com/path');
  });

  it('drops an unsafe image URL', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [
              { type: 'img', url: 'javascript:alert(1)', children: [] },
            ],
          } as any
        }
      />
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('');
  });
});
