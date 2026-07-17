import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { beforeEach } from 'vitest';
import { useFormStore } from '../form/form-store';

// findBy*/waitFor default to 1s — too tight for TinaProvider's async boot
// (plugin graph + lazy segment imports) on loaded CI runners.
configure({ asyncUtilTimeout: 5000 });

// node ≥23 ships its own globalThis.localStorage that shadows happy-dom's and is
// non-functional without --localstorage-file, so tests bring their own in-memory
// Storage — deterministic on every node version.
const entries = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, String(value)),
    removeItem: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
    key: (index: number) => [...entries.keys()][index] ?? null,
    get length() {
      return entries.size;
    },
  },
});

// The form-store is a module-level singleton, so its state bleeds across tests.
// Reset it here for every test file rather than mandating a beforeEach per file.
// localStorage too: every createTinaStore persists/rehydrates the shared
// 'tina-store' key, so durable namespaces would otherwise leak between tests.
beforeEach(() => {
  useFormStore.setState({ forms: {}, active: null });
  localStorage.clear();
});
