import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PullRequestStatusField } from './pull-request-status-field';

describe('PullRequestStatusField', () => {
  it('marks the active segment based on the isDraft prop', () => {
    const { getByRole } = render(
      <PullRequestStatusField isDraft={true} onChange={() => {}} />
    );
    expect(
      getByRole('button', { name: 'Draft' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      getByRole('button', { name: 'Ready for review' }).getAttribute(
        'aria-pressed'
      )
    ).toBe('false');
  });

  it('calls onChange(false) when Ready for review is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByRole } = render(
      <PullRequestStatusField isDraft={true} onChange={onChange} />
    );

    await user.click(getByRole('button', { name: 'Ready for review' }));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange(true) when Draft is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByRole } = render(
      <PullRequestStatusField isDraft={false} onChange={onChange} />
    );

    await user.click(getByRole('button', { name: 'Draft' }));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
