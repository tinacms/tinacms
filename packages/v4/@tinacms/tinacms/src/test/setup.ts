import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { beforeEach } from 'vitest';
import { useFormStore } from '../form/form-store';

// findBy*/waitFor default to 1s — too tight for TinaProvider's async boot
// (plugin graph + lazy segment imports) on loaded CI runners.
configure({ asyncUtilTimeout: 5000 });

// The form-store is a module-level singleton, so its state bleeds across tests.
// Reset it here for every test file rather than mandating a beforeEach per file.
// localStorage too: every createTinaStore persists/rehydrates the shared
// 'tina-store' key, so durable namespaces would otherwise leak between tests.
beforeEach(() => {
  useFormStore.setState({ forms: {}, active: null });
  localStorage.clear();
});
