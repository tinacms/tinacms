import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { AuthSlice } from '../core/auth/contract';
import { asResolvedConfig } from '../config';
import { type PluginManifest, definePlugin } from '../core/plugin';
import { testAuthPlugin } from '../test/test-auth-plugin';
import { TinaAdmin } from './admin';

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: async () => [],
        get: async () => null,
        update: async () => {
          throw new Error('read-only');
        },
      }),
    },
  }),
});

const renderAdmin = (plugins: PluginManifest[]) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [contentPlugin, ...plugins],
        schema: {
          collections: [
            {
              name: 'post',
              label: 'Posts',
              path: 'content/posts',
              format: 'mdx',
              fields: [],
            },
          ],
        },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

describe('AuthGate', () => {
  it('shows the admin with no sign-in screen when no plugin provides auth', async () => {
    renderAdmin([]);
    expect(
      await screen.findByRole('list', { name: 'Collections' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Account' })).toBeNull();
  });

  it('signs the editor in, shows who they are, and signs them out', async () => {
    const user = userEvent.setup();
    renderAdmin([testAuthPlugin('test:auth', { id: 'ada', name: 'Ada' })]);

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    const account = await screen.findByRole('list', { name: 'Account' });
    expect(account).toHaveTextContent('Ada');
    expect(
      screen.getByRole('list', { name: 'Collections' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(
      await screen.findByRole('button', { name: 'Sign in' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Collections' })).toBeNull();
  });

  it("shows the plugin's own sign-in screen instead of the default", async () => {
    const user = userEvent.setup();
    const formAuthPlugin = definePlugin({
      name: 'test:form-auth',
      provides: ['auth'],
      client: async () => ({
        default: {
          slice: (set) =>
            ({
              status: 'signed-out',
              user: null,
              getToken: async () => undefined,
              login: async () => {},
              logout: async () => set({ status: 'signed-out', user: null }),
              LoginScreen: () => (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const email = new FormData(event.currentTarget).get(
                      'email'
                    );
                    set({
                      status: 'signed-in',
                      user: { id: 'ada', email: String(email) },
                    });
                  }}
                >
                  <input name='email' aria-label='Email' />
                  <button type='submit'>Continue</button>
                </form>
              ),
            }) satisfies AuthSlice,
        },
      }),
    });
    renderAdmin([formAuthPlugin]);

    await user.type(await screen.findByLabelText('Email'), 'ada@example.com');
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      await screen.findByRole('list', { name: 'Account' })
    ).toHaveTextContent('ada@example.com');
  });
});
