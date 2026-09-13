import { render } from '@testing-library/react';
import React from 'react';
import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  // Cloud (v2) folder names arrive with a trailing slash (e.g. "uploads/").
  it('renders a single Media root for a trailing-slash directory', () => {
    const { getAllByText } = render(
      <Breadcrumb directory='uploads/' setDirectory={() => {}} />
    );
    expect(getAllByText('Media')).toHaveLength(1);
    expect(getAllByText('uploads')).toHaveLength(1);
  });

  it('renders a single Media root for a leading-slash directory', () => {
    const { getAllByText } = render(
      <Breadcrumb directory='/uploads' setDirectory={() => {}} />
    );
    expect(getAllByText('Media')).toHaveLength(1);
    expect(getAllByText('uploads')).toHaveLength(1);
  });

  it('back navigates to the root from a top-level folder', () => {
    const setDirectory = vi.fn();
    const { container } = render(
      <Breadcrumb directory='uploads/' setDirectory={setDirectory} />
    );
    const backButton = container.querySelector('button');
    (backButton as HTMLButtonElement).click();
    expect(setDirectory).toHaveBeenCalledWith('');
  });

  it('back navigates one level up from a nested folder', () => {
    const setDirectory = vi.fn();
    const { container, getAllByText } = render(
      <Breadcrumb directory='uploads/nested/' setDirectory={setDirectory} />
    );
    expect(getAllByText('Media')).toHaveLength(1);
    const backButton = container.querySelector('button');
    (backButton as HTMLButtonElement).click();
    expect(setDirectory).toHaveBeenCalledWith('/uploads');
  });
});
