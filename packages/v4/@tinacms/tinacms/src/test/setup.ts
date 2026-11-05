import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { beforeAll, beforeEach, vi } from 'vitest';
import { resolveClientSegments } from '../core/plugin';
import { useFormStore } from '../form/form-store';
import { corePlugins } from '../plugins/fields';

const gate = vi.hoisted(() => ({ providerLoaded: false }));

vi.mock('../editor/provider', (importOriginal) => {
  gate.providerLoaded = true;
  return importOriginal();
});

// TinaProvider renders null until its client() thunks resolve. Warm them before any
// test body, in files that load the provider, so the import stays out of findBy* budgets.
beforeAll(async () => {
  if (gate.providerLoaded) await resolveClientSegments(corePlugins);
}, 30_000);

// Backstop. No test that renders <TinaProvider> should need the headroom.
configure({ asyncUtilTimeout: 5000 });

// react-aria restores HTMLElement.prototype.focus by assignment on `beforeunload`.
// A render turns that property into a getter-only accessor, so the restore throws.
const keepFocusAssignable = () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'focus'
  );
  if (!descriptor || 'value' in descriptor) return;
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    value: HTMLElement.prototype.focus,
    writable: true,
    configurable: true,
  });
};

beforeEach(() => {
  keepFocusAssignable();
  useFormStore.getState().setBranch(undefined);
  useFormStore.setState({
    userId: undefined,
    forms: {},
    saves: {},
    active: null,
  });
  localStorage.clear();
});
