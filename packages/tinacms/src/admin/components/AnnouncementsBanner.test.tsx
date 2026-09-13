import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TinaCMSProvider } from '@toolkit/components/tina-cms-provider';
import { TinaCMS } from '@toolkit/tina-cms';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import pkg from '../../../package.json';
import type { Announcement } from '../../internalClient';
import {
  AnnouncementsBanner,
  AnnouncementsProvider,
  DISMISSED_KEY,
  resetDismissedStore,
} from './AnnouncementsBanner';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const announcement = (overrides: Partial<Announcement> = {}): Announcement => ({
  id: 'a-1',
  headline: 'New version available',
  body: 'Upgrade to the latest.',
  severity: 'info',
  ...overrides,
});

const createCMS = (getAnnouncements: ReturnType<typeof vi.fn>) => {
  const cms = new TinaCMS({ enabled: true, sidebar: true });
  cms.registerApi('tina', { getAnnouncements });
  return cms;
};

const renderBanner = (getAnnouncements: ReturnType<typeof vi.fn>) => {
  const cms = createCMS(getAnnouncements);
  return render(
    <TinaCMSProvider cms={cms}>
      <AnnouncementsBanner />
    </TinaCMSProvider>
  );
};

describe('AnnouncementsBanner', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetDismissedStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders nothing before the fetch resolves', () => {
    renderBanner(vi.fn().mockReturnValue(new Promise(() => {})));
    expect(screen.queryByText('New version available')).toBeNull();
  });

  it('fetches announcements using the current package version', async () => {
    const getAnnouncements = vi.fn().mockResolvedValue([announcement()]);
    renderBanner(getAnnouncements);
    await screen.findByText('New version available');
    expect(getAnnouncements).toHaveBeenCalledWith(pkg.version);
  });

  it('renders the announcement headline and body', async () => {
    renderBanner(vi.fn().mockResolvedValue([announcement()]));
    expect(await screen.findByText('New version available')).not.toBeNull();
    expect(screen.getByText('Upgrade to the latest.')).not.toBeNull();
  });

  it('renders the current version and the targeted version range', async () => {
    renderBanner(
      vi.fn().mockResolvedValue([announcement({ versionRange: '<4.0.0' })])
    );
    await screen.findByText('New version available');
    expect(
      screen.getByText(
        new RegExp(`Your version: ${pkg.version}.*Targets: <4.0.0`)
      )
    ).not.toBeNull();
  });

  it('renders nothing when the fetch resolves to null', async () => {
    renderBanner(vi.fn().mockResolvedValue(null));
    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it('renders nothing when the fetch resolves to an empty list', async () => {
    renderBanner(vi.fn().mockResolvedValue([]));
    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it.each([
    ['info', 'border-blue-600/20'],
    ['warning', 'border-amber-700/20'],
    ['critical', 'border-red-600/20'],
  ])(
    'maps the %s severity to the %s callout style',
    async (severity, borderClass) => {
      const { container } = renderBanner(
        vi.fn().mockResolvedValue([announcement({ severity } as Announcement)])
      );
      await screen.findByText('New version available');
      expect(
        container.querySelector(`[class*="${borderClass}"]`)
      ).not.toBeNull();
    }
  );

  it('falls back to the info style for unknown severities', async () => {
    const { container } = renderBanner(
      vi
        .fn()
        .mockResolvedValue([
          announcement({ severity: 'bogus' as Announcement['severity'] }),
        ])
    );
    await screen.findByText('New version available');
    expect(
      container.querySelector('[class*="border-blue-600/20"]')
    ).not.toBeNull();
  });

  it('dismisses a non-critical announcement and persists the dismissal', async () => {
    const getAnnouncements = vi.fn().mockResolvedValue([announcement()]);
    const { unmount } = renderBanner(getAnnouncements);
    await screen.findByText('New version available');

    await userEvent.click(screen.getByLabelText('Dismiss'));

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      DISMISSED_KEY,
      JSON.stringify(['a-1'])
    );

    unmount();
    renderBanner(getAnnouncements);
    await waitFor(() => expect(getAnnouncements).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('New version available')).toBeNull();
  });

  it('renders critical announcements without a dismissible button', async () => {
    renderBanner(
      vi.fn().mockResolvedValue([announcement({ severity: 'critical' })])
    );
    await screen.findByText('New version available');
    const button = screen.getByLabelText(
      'Critical alert cannot be dismissed'
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.queryByLabelText('Dismiss')).toBeNull();
  });

  it('shows critical announcements even when previously dismissed', async () => {
    localStorageMock.setItem(DISMISSED_KEY, JSON.stringify(['a-1']));
    renderBanner(
      vi.fn().mockResolvedValue([announcement({ severity: 'critical' })])
    );
    expect(await screen.findByText('New version available')).not.toBeNull();
  });

  it('ignores corrupt dismissed data in localStorage', async () => {
    localStorageMock.setItem(DISMISSED_KEY, '{not valid json');
    renderBanner(vi.fn().mockResolvedValue([announcement()]));
    expect(await screen.findByText('New version available')).not.toBeNull();
  });

  it('renders nothing when the fetch fails', async () => {
    const error = new Error('network');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    renderBanner(vi.fn().mockRejectedValue(error));
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'failed to fetch announcements',
        error
      );
    });
    expect(screen.queryByText('New version available')).toBeNull();
  });
});

describe('AnnouncementsProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetDismissedStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('fetches once and shares announcements with nested banners', async () => {
    const getAnnouncements = vi.fn().mockResolvedValue([announcement()]);
    const cms = createCMS(getAnnouncements);
    render(
      <TinaCMSProvider cms={cms}>
        <AnnouncementsProvider>
          <AnnouncementsBanner />
          <AnnouncementsBanner />
        </AnnouncementsProvider>
      </TinaCMSProvider>
    );
    await waitFor(() => {
      expect(getAnnouncements).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findAllByText('New version available')).toHaveLength(2);
  });

  it('shares dismissal state across nested banners', async () => {
    const getAnnouncements = vi.fn().mockResolvedValue([announcement()]);
    const cms = createCMS(getAnnouncements);
    render(
      <TinaCMSProvider cms={cms}>
        <AnnouncementsProvider>
          <AnnouncementsBanner />
          <AnnouncementsBanner />
        </AnnouncementsProvider>
      </TinaCMSProvider>
    );
    const buttons = await screen.findAllByLabelText('Dismiss');
    expect(buttons).toHaveLength(2);

    await userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      DISMISSED_KEY,
      JSON.stringify(['a-1'])
    );
  });

  it('syncs dismissal across independent banner trees via module store', async () => {
    const getAnnouncements = vi.fn().mockResolvedValue([announcement()]);
    const cms = createCMS(getAnnouncements);

    // Two separate TinaCMSProvider trees — no shared context.
    // The module-level store should still keep them in sync.
    const { unmount: unmountA } = render(
      <TinaCMSProvider cms={cms}>
        <AnnouncementsBanner />
      </TinaCMSProvider>
    );
    await screen.findByText('New version available');

    const { unmount: unmountB } = render(
      <TinaCMSProvider cms={cms}>
        <AnnouncementsBanner />
      </TinaCMSProvider>
    );
    await waitFor(() => {
      expect(screen.getAllByLabelText('Dismiss')).toHaveLength(2);
    });
    const buttons = screen.getAllByLabelText('Dismiss');

    await userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });

    unmountA();
    unmountB();
  });
});
