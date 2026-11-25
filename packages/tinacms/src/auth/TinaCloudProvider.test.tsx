import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { TinaCMS } from '@tinacms/toolkit';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_REDIRECTING } from './authenticate';
import { TinaCloudProvider } from './TinaCloudProvider';

vi.mock('../lib/posthog/posthogProvider', () => ({ captureEvent: vi.fn() }));
vi.mock('./tina-login.png', () => ({ default: '' }));

const makeCms = (authenticate: () => Promise<unknown>, onLogin = vi.fn()) => {
  const cms = new TinaCMS({ enabled: true, sidebar: false });
  const events: string[] = [];
  cms.events.subscribe('cms:login', () => events.push('cms:login'));
  const authProvider = {
    getLoginStrategy: () => 'Redirect',
    getLoginScreen: () => null,
    getSessionProvider:
      () =>
      ({ children }: any) => <>{children}</>,
    isAuthenticated: vi.fn().mockResolvedValue(false),
    authenticate: vi.fn(authenticate),
    getToken: vi.fn().mockResolvedValue(null),
  };
  const client = {
    authProvider,
    isLocalMode: false,
    schema: { config: { config: {} } },
    onLogin,
    setBranch: vi.fn(),
  };
  cms.registerApi('tina', client as any);
  return { cms, events, authProvider, onLogin };
};

const renderProvider = (cms: TinaCMS) =>
  render(
    <TinaCloudProvider
      cms={cms}
      schema={{ config: {} } as any}
      staticMedia={{} as any}
    >
      <div>children</div>
    </TinaCloudProvider>
  );

const loginButton = () =>
  document.querySelector('[data-test="log-in"]') as HTMLButtonElement | null;

const logIn = async () => {
  await screen.findByRole('button', { name: 'Log in' });
  await act(async () => {
    fireEvent.click(loginButton()!);
  });
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('TinaCloudProvider login modal', () => {
  it('keeps the modal open and busy while a redirect login is leaving the page', async () => {
    const { cms, events, authProvider, onLogin } = makeCms(
      async () => AUTH_REDIRECTING
    );
    renderProvider(cms);

    await logIn();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });

    expect(loginButton()!.disabled).toBe(true);
    expect(onLogin).not.toHaveBeenCalled();
    expect(events).toEqual([]);
    expect(authProvider.isAuthenticated).toHaveBeenCalledTimes(1);
  });

  it('makes Log in usable again when the page is restored from bfcache', async () => {
    const { cms, onLogin } = makeCms(async () => AUTH_REDIRECTING);
    renderProvider(cms);
    await logIn();

    await act(async () => {
      const e = new Event('pageshow') as PageTransitionEvent;
      Object.defineProperty(e, 'persisted', { value: true });
      window.dispatchEvent(e);
    });

    expect(loginButton()!.disabled).toBe(false);
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('ignores a pageshow that is not from the bfcache', async () => {
    const { cms } = makeCms(async () => AUTH_REDIRECTING);
    renderProvider(cms);
    await logIn();

    await act(async () => {
      const e = new Event('pageshow') as PageTransitionEvent;
      Object.defineProperty(e, 'persisted', { value: false });
      window.dispatchEvent(e);
    });

    expect(loginButton()!.disabled).toBe(true);
  });

  it('makes Log in usable again when the redirect never leaves the page', async () => {
    const { cms, events, onLogin } = makeCms(async () => AUTH_REDIRECTING);
    renderProvider(cms);
    await screen.findByRole('button', { name: 'Log in' });
    vi.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.click(loginButton()!);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(14_000);
      });
      expect(loginButton()!.disabled).toBe(true);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000);
      });
      expect(loginButton()!.disabled).toBe(false);
      expect(onLogin).not.toHaveBeenCalled();
      expect(events).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('runs onLogin and closes the modal when authenticate returns a token', async () => {
    const token = { access_token: 'a', id_token: 'i', refresh_token: 'r' };
    const { cms, events, onLogin } = makeCms(async () => token);
    renderProvider(cms);
    await logIn();

    expect(onLogin).toHaveBeenCalledWith({ token });
    expect(events).toEqual(['cms:login']);
    expect(loginButton()).toBeNull();
  });

  it('still logs in when authenticate returns nothing (custom provider)', async () => {
    const { cms, events, onLogin } = makeCms(async () => undefined);
    renderProvider(cms);
    await logIn();

    expect(onLogin).toHaveBeenCalledWith({ token: undefined });
    expect(events).toEqual(['cms:login']);
  });

  it('shows the error modal when authenticate throws', async () => {
    const { cms, onLogin } = makeCms(async () => {
      throw new Error('config fetch failed');
    });
    renderProvider(cms);
    await logIn();

    expect(await screen.findByText(/config fetch failed/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(onLogin).not.toHaveBeenCalled();
  });
});
