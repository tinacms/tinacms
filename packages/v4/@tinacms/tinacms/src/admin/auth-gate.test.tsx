import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import {
  AuthError,
  type AuthSlice,
  type AuthUser,
  toUserId,
} from '../core/auth/contract';
import { definePlugin, type PluginManifest } from '../core/plugin';
import { stringFieldPlugin } from '../plugins/fields/string/string-field.plugin';
import { simulateReload } from '../test/simulate-reload';
import { testAuthPlugin } from '../test/test-auth-plugin';
import { TinaAdmin } from './admin';

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: async () => [{ path: 'content/posts/hello.mdx' }],
        get: async () => ({
          path: 'content/posts/hello.mdx',
          document: { title: 'Hello' },
        }),
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
        plugins: [stringFieldPlugin, contentPlugin, ...plugins],
        schema: {
          collections: [
            {
              name: 'post',
              label: 'Posts',
              path: 'content/posts',
              format: 'mdx',
              fields: [{ name: 'title', label: 'Title', type: 'string' }],
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
    renderAdmin([
      testAuthPlugin('test:auth', { id: toUserId('ada'), name: 'Ada' }),
    ]);

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

  it('shows why the last sign-in failed on the sign-in screen', async () => {
    const failedAuthPlugin = definePlugin({
      name: 'test:failed-auth',
      provides: ['auth'],
      client: async () => ({
        default: {
          slice: () =>
            ({
              status: 'signed-out',
              user: null,
              error: new AuthError('no-access'),
              getToken: async () => undefined,
              login: async () => {},
              logout: async () => {},
            }) satisfies AuthSlice,
        },
      }),
    });
    renderAdmin([failedAuthPlugin]);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This account has no access to this project.'
    );
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
                      user: { id: toUserId('ada'), email: String(email) },
                      roles: ['editor'],
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

  it('shows who is signed in, keeps the admin closed, and signs out when the account has no access', async () => {
    const user = userEvent.setup();
    const forbiddenAuthPlugin = definePlugin({
      name: 'test:forbidden-auth',
      provides: ['auth'],
      client: async () => ({
        default: {
          slice: (set) =>
            ({
              status: 'forbidden',
              user: { id: toUserId('mal'), name: 'Mal' },
              getToken: async () => undefined,
              login: async () => {},
              logout: async () => set({ status: 'signed-out', user: null }),
            }) satisfies AuthSlice,
        },
      }),
    });
    renderAdmin([forbiddenAuthPlugin]);

    expect(
      await screen.findByRole('heading', { name: "You don't have access" })
    ).toBeInTheDocument();
    expect(screen.getByText(/signed in as Mal/)).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Collections' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(
      await screen.findByRole('button', { name: 'Sign in' })
    ).toBeInTheDocument();
  });

  it('isolates unsaved edits per editor in the same tab and across a reload', async () => {
    window.location.hash = '';
    const ada: AuthUser = { id: toUserId('ada'), name: 'Ada' };
    const grace: AuthUser = { id: toUserId('grace'), name: 'Grace' };
    let nextUser: AuthUser = ada;
    const sharedBrowserAuth = definePlugin({
      name: 'test:shared-browser-auth',
      provides: ['auth'],
      client: async () => ({
        default: {
          slice: (set) =>
            ({
              status: 'signed-out',
              user: null,
              getToken: async () => undefined,
              login: async () =>
                set({ status: 'signed-in', user: nextUser, roles: ['editor'] }),
              logout: async () => set({ status: 'signed-out', user: null }),
            }) satisfies AuthSlice,
        },
      }),
    });

    const user = userEvent.setup();
    const firstTab = renderAdmin([sharedBrowserAuth]);

    // Ada signs in, opens hello.mdx, leaves unsaved edits, and signs out.
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    const adaInput = await screen.findByRole('textbox', { name: /^Title/ });
    expect(adaInput).toHaveValue('Hello');
    await user.type(adaInput, ' from Ada');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Unsaved')
    );
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    // Grace signs in on the same tab and sees the saved document, not Ada's edits.
    nextUser = grace;
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    const graceInput = await screen.findByRole('textbox', { name: /^Title/ });
    expect(graceInput).toHaveValue('Hello');
    expect(screen.getByRole('status')).toHaveTextContent('No changes');
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    // Ada signs back in on the same tab and recovers her draft.
    nextUser = ada;
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    const adaRestored = await screen.findByRole('textbox', { name: /^Title/ });
    expect(adaRestored).toHaveValue('Hello from Ada');
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved');
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    // After a reload, Grace still sees the saved document and Ada still recovers her draft.
    firstTab.unmount();
    simulateReload();

    nextUser = grace;
    const graceReloaded = renderAdmin([sharedBrowserAuth]);
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Hello'
    );
    expect(screen.getByRole('status')).toHaveTextContent('No changes');
    graceReloaded.unmount();
    simulateReload();

    nextUser = ada;
    renderAdmin([sharedBrowserAuth]);
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Hello from Ada'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved');
  });
});
