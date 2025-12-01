import { act, cleanup, render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { TinaCMS } from '../tina-cms';
import { TinaCMSProvider } from './tina-cms-provider';
import { TinaUI } from './tina-ui';

// Mock localStorage
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

// Helper to create a fresh CMS instance for each test
const createCMS = (options: { enabled: boolean; sidebar: boolean }) => {
  const cms = new TinaCMS(options);
  cms.registerApi('admin', {
    fetchCollections: () => [],
  });
  return cms;
};

describe('TinaUI', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('when the CMS is enabled', () => {
    describe('when sidebar is true', () => {
      it('renders children', () => {
        const cms = createCMS({ enabled: true, sidebar: true });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        );

        app.getByText('something');
      });
      it('renders the "open cms" sidebar button', () => {
        const cms = createCMS({ enabled: true, sidebar: true });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        );

        app.getByLabelText('Show editing panel');
      });
    });
    describe('when sidebar is false', () => {
      it('renders children', () => {
        const cms = createCMS({ enabled: true, sidebar: false });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        );

        app.getByText('something');
      });
      it('does not render the "opens cms" sidebar button', () => {
        const cms = createCMS({ enabled: true, sidebar: false });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        );

        const sidebarButton = app.queryByLabelText('Show editing panel');
        expect(sidebarButton).toBeNull();
      });
    });
  });
  describe('when the CMS is disabled', () => {
    describe('when sidebar is true', () => {
      it('renders children', () => {
        const cms = createCMS({ enabled: false, sidebar: true });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        );

        app.getByText('something');
      });
      it('does not render the "opens cms" sidebar button', () => {
        const cms = createCMS({ enabled: false, sidebar: true });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        );

        const sidebarButton = app.queryByLabelText('Show editing panel');
        expect(sidebarButton).toBeNull();
      });
      it('does not remount children when cms is toggled', () => {
        const cms = createCMS({ enabled: false, sidebar: true });

        const onMount = vi.fn();
        function Child() {
          useEffect(onMount, []);
          return null;
        }
        render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <Child />
            </TinaUI>
          </TinaCMSProvider>
        );

        act(() => {
          cms.enable();
        });

        expect(onMount).toHaveBeenCalledTimes(1);
      });
    });
    describe('when sidebar is false', () => {
      it('renders children', () => {
        const cms = createCMS({ enabled: false, sidebar: false });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        );

        app.getByText('something');
      });
      it('does not render the "opens cms" sidebar button', () => {
        const cms = createCMS({ enabled: false, sidebar: false });
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        );

        const sidebarButton = app.queryByLabelText('Show editing panel');
        expect(sidebarButton).toBeNull();
      });
    });
  });
});
