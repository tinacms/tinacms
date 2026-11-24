import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider } from '../core/content/contract';
import type { MediaProvider } from '../core/media/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import { simulateReload } from '../test/simulate-reload';
import imageFieldPlugin from '../plugins/fields/image/image-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { connectionOf } from '../test/connection';
import { TinaAdmin } from './admin';

const written: TinaDocument[] = [];
let stored: TinaDocument;

const contentPlugin = () => {
  const provider: ContentProvider = {
    list: async () => connectionOf([{ path: 'content/posts/hello.mdx' }]),
    get: async () => ({ path: 'content/posts/hello.mdx', document: stored }),
    update: async (_collection, path, value) => {
      written.push(value);
      stored = { ...value };
      return { path, document: stored };
    },
  };
  return definePlugin({
    name: 'test:content',
    provides: ['content'],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });
};

const media: MediaProvider = {
  upload: async (file) => file.name,
  list: async () => ({
    items: [
      { path: 'photo.jpg', kind: 'file' },
      { path: 'sunset.jpg', kind: 'file' },
    ],
  }),
  delete: async () => {},
  resolveUrl: (path) => `/uploads/${path}`,
};

const mediaPlugin = definePlugin({
  name: 'test:media',
  provides: ['media'],
  client: async () => ({ default: { slice: () => ({ ...media }) } }),
});

const upcase = definePlugin({
  name: 'test:hooks',
  provides: ['hooks'],
  hooks: ['shout'],
  client: async () => ({
    default: {
      hooks: {
        shout: () => ({
          beforeSave: (document: TinaDocument) => ({
            ...document,
            title: String(document.title).toUpperCase(),
          }),
        }),
      },
    },
  }),
});

const renderAdmin = (hooked: boolean) => {
  window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
  return render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin(),
          mediaPlugin,
          upcase,
          stringFieldPlugin,
          imageFieldPlugin,
          coreValidatorsPlugin,
        ],
        schema: {
          collections: [
            {
              name: 'post',
              label: 'Posts',
              path: 'content/posts',
              format: 'mdx',
              hooks: hooked ? [{ name: 'shout' }] : [],
              fields: [
                { name: 'title', label: 'Title', type: 'string' },
                { name: 'hero', label: 'Hero', type: 'image' },
              ],
            },
          ],
        },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );
};

beforeEach(() => {
  written.length = 0;
  stored = { title: 'Hello' };
  useFormStore.setState({ forms: {} });
});

describe.each([
  ['a plain save', false],
  ['a save a beforeSave hook rewrites', true],
])('saving with the media picker open after %s', (_name, rewriting) => {
  it('closes the picker, writes no pick, leaves the form clean and keeps focus off body', async () => {
    const user = userEvent.setup();
    const errors = vi.spyOn(console, 'error');
    renderAdmin(rewriting);
    const title = await screen.findByLabelText(/^Title\b/);
    await user.type(title, '!');
    const hero = await screen.findByRole('group', { name: /^Hero\b/ });
    await user.click(
      within(hero).getByRole('button', { name: 'Choose from Media' })
    );
    const picker = await screen.findByRole('region', {
      name: 'Choose an image',
    });
    await user.click(
      await within(picker).findByRole('button', { name: 'photo.jpg' })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull()
    );
    expect(screen.queryByRole('button', { name: 'Choose image' })).toBeNull();
    await waitFor(() => expect(written).toHaveLength(1));
    expect(written[0]).toEqual({ title: rewriting ? 'HELLO!' : 'Hello!' });
    await waitFor(() =>
      expect(
        within(
          screen.getByRole('complementary', { name: 'Document form' })
        ).getByRole('status')
      ).toHaveTextContent('Saved')
    );
    expect(screen.queryByText(/Unsaved/)).toBeNull();
    expect(
      within(await screen.findByRole('group', { name: /^Hero\b/ })).getByRole(
        'button',
        { name: 'Choose from Media' }
      )
    ).toBeVisible();
    await waitFor(() => {
      const region = document.querySelector('[data-form-id]');
      expect(document.activeElement).not.toBe(document.body);
      expect(region?.contains(document.activeElement)).toBe(true);
    });
    expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});

describe('resuming stored edits with the media picker open', () => {
  it('closes the picker and leaves focus off body once the Resume prompt is gone', async () => {
    const user = userEvent.setup();
    const first = renderAdmin(false);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    first.unmount();
    act(simulateReload);

    renderAdmin(false);
    const hero = await screen.findByRole('group', { name: /^Hero\b/ });
    await user.click(
      within(hero).getByRole('button', { name: 'Choose from Media' })
    );
    await screen.findByRole('region', { name: 'Choose an image' });
    await user.click(await screen.findByRole('button', { name: 'Resume' }));

    await waitFor(() =>
      expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull()
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(document.activeElement).not.toBe(document.body);
    expect(written).toHaveLength(0);
  });
});
