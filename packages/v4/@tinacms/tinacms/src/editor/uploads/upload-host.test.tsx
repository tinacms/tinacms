import { QueryClient } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../config';
import { TinaProvider } from '../provider';
import { UploadHost } from './upload-host';

const renderHosts = (hosts: { primary?: boolean }[]) =>
  render(
    <TinaProvider
      config={asResolvedConfig({ plugins: [], schema: { collections: [] } })}
      queryClient={new QueryClient()}
    >
      {hosts.map(({ primary }, index) => (
        <UploadHost key={index} primary={primary} />
      ))}
    </TinaProvider>
  );

const statuses = () => document.querySelectorAll('[data-upload-status]');

describe('the upload host', () => {
  it('draws the status once when several fallback hosts are mounted', async () => {
    renderHosts([{}, {}, {}]);
    await waitFor(() => expect(statuses()).toHaveLength(1));
  });

  it('lets the primary host draw, and the fallbacks stay silent', async () => {
    renderHosts([{}, { primary: true }, {}]);
    await waitFor(() => expect(statuses()).toHaveLength(1));
  });

  it('hands the status to the next fallback when the first one leaves', async () => {
    const { rerender } = renderHosts([{}, {}]);
    await waitFor(() => expect(statuses()).toHaveLength(1));
    rerender(
      <TinaProvider
        config={asResolvedConfig({ plugins: [], schema: { collections: [] } })}
        queryClient={new QueryClient()}
      >
        <UploadHost key={1} />
      </TinaProvider>
    );
    await waitFor(() => expect(statuses()).toHaveLength(1));
  });
});
