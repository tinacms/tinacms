import { act, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { TinaCMS } from '../tina-cms';
import { TinaProvider } from './tina-provider';

describe('TinaProvider', () => {
  it('mounts the editorial workflow provider around the sidebar', () => {
    const cms = new TinaCMS({ enabled: true, sidebar: false });
    const app = render(<TinaProvider cms={cms} />);

    act(() => {
      cms.events.dispatch({
        type: 'media:workflow:start',
        branchName: 'tina/x',
      });
    });

    expect(app.getByText('Saving to a new branch')).toBeTruthy();
  });
});
